// controllers/productPublic.js
import mongoose from "mongoose";
import Product from "../Models/Product.js";
import ProductVariant from "../Models/ProductVariant.js";
import Inventory from "../Models/Inventory.js";
import Review from "../Models/Review.js";
import { redis } from "../lib/redis.js";

/* -------------------------------------------------------------
   Cache helpers + small utils
------------------------------------------------------------- */
const cacheGet = async (key) => {
  const v = await redis.get(key);
  return v ? JSON.parse(v) : null;
};
const cacheSet = async (key, val, ttl = 120) => {
  await redis.set(key, JSON.stringify(val), { EX: ttl });
};
const cacheKeyFromReq = (req, prefix) =>
  `${prefix}:${req.originalUrl.replace(/\W+/g, ":")}`.toLowerCase();

const toNum = (v, d) => (v !== undefined && v !== null ? Number(v) : d);
const toArr = (v) =>
  typeof v === "string"
    ? v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : Array.isArray(v)
    ? v
    : [];

/* -------------------------------------------------------------
   Common product projection for lists
------------------------------------------------------------- */
const listSelect = {
  title: 1,
  slug: 1,
  coverImage: 1,
  ratingAvg: 1,
  ratingCount: 1,
  availableColors: 1,
  availableSizes: 1,
  collections: 1,
  publishAt: 1,
  isTrending: 1,
  clicks: 1,
  purchases: 1,
  defaultVariantSku: 1,
  basePrice: 1,
};

/* -------------------------------------------------------------
   Filters (no text search here)
------------------------------------------------------------- */
const buildFilter = (q) => {
  const filter = {};
  const categories = toArr(q.categories);
  if (categories.length) {
    filter.categories = {
      $in: categories.map((id) => new mongoose.Types.ObjectId(id)),
    };
  }
  const colors = toArr(q.colors);
  if (colors.length)
    filter.availableColors = { $in: colors.map((c) => c.toLowerCase()) };
  const sizes = toArr(q.sizes);
  if (sizes.length)
    filter.availableSizes = { $in: sizes.map((s) => s.toUpperCase()) };
  const tags = toArr(q.tags);
  if (tags.length) filter.tags = { $in: tags.map((t) => t.toLowerCase()) };

  const sleeveLength = (q.sleeveLength || "").toLowerCase();
  if (sleeveLength) {
    const allowed = ["full", "half", "three-quarter", "sleeveless"];
    if (allowed.includes(sleeveLength)) filter.sleeveLength = sleeveLength;
  }
  const fitType = (q.fitType || "").toLowerCase();
  if (fitType) {
    const allowed = [
      "regular",
      "slim",
      "loose",
      "skinny",
      "relaxed",
      "oversized",
      "box",
    ];
    if (allowed.includes(fitType)) filter.fitType = fitType;
  }
  const material = (q.material || "").toLowerCase();
  if (material) {
    const allowed = [
      "cotton",
      "polyester",
      "wool",
      "linen",
      "silk",
      "denim",
      "leather",
      "rayon",
      "nylon",
      "spandex",
      "chiffon",
      "velvet",
      "corduroy",
      "fleece",
      "cashmere",
      "suede",
      "lace",
    ];
    if (allowed.includes(material)) filter.material = material;
  }

  // keeping your priceMin/priceMax passthrough as-is (no functional change)
  const priceMin = toNum(q.priceMin, null);
  if (priceMin !== null) filter.priceMin = { $gte: priceMin };
  const priceMax = toNum(q.priceMax, null);
  if (priceMax !== null) filter.priceMax = { $lte: priceMax };

  return filter;
};

/* -------------------------------------------------------------
   Cursor helpers
   - lists/filters: custom sort (new | price_asc | price_desc | rating | popular)
   - search:        text score DESC, _id DESC
------------------------------------------------------------- */
const encodeCursor = (obj) =>
  Buffer.from(JSON.stringify(obj)).toString("base64");
const decodeCursor = (str) => {
  if (!str) return null;
  try {
    return JSON.parse(Buffer.from(String(str), "base64").toString("utf8"));
  } catch {
    return null;
  }
};

const afterByPublish = (cursor) => {
  if (!cursor?.publishAt || !cursor?._id) return {};
  const d = new Date(cursor.publishAt);
  return {
    $or: [
      { publishAt: { $lt: d } },
      { publishAt: d, _id: { $lt: new mongoose.Types.ObjectId(cursor._id) } },
    ],
  };
};

const afterByScore = (cursor) => {
  if (cursor?.score === undefined || !cursor?._id) return {};
  return {
    $or: [
      { score: { $lt: cursor.score } },
      {
        score: cursor.score,
        _id: { $lt: new mongoose.Types.ObjectId(cursor._id) },
      },
    ],
  };
};

/* -------------------------------------------------------------
   Sort mapping + generic "after" condition for cursors
   Supported sorts: new | price_asc | price_desc | rating | popular
------------------------------------------------------------- */
const buildSort = (sortKey = "new") => {
  switch (String(sortKey).toLowerCase()) {
    case "price_asc":
      return {
        primary: "basePrice",
        order: "asc",
        sort: { basePrice: 1, _id: 1 },
      };
    case "price_desc":
      return {
        primary: "basePrice",
        order: "desc",
        sort: { basePrice: -1, _id: -1 },
      };
    case "rating":
      return {
        primary: "ratingAvg",
        order: "desc",
        sort: { ratingAvg: -1, ratingCount: -1, _id: -1 },
        ties: ["ratingCount"],
      };
    case "popular":
      return {
        primary: "purchases",
        order: "desc",
        sort: { purchases: -1, clicks: -1, publishAt: -1, _id: -1 },
        ties: ["clicks", "publishAt"],
      };
    case "new":
    default:
      return {
        primary: "publishAt",
        order: "desc",
        sort: { publishAt: -1, _id: -1 },
      };
  }
};

const afterBySort = (cursor, config) => {
  if (!cursor) return {};
  const { primary, order, ties = [] } = config;
  if (cursor[primary] === undefined && primary !== "publishAt") return {};
  const parts = [...ties, "_id"];
  const dir = order === "asc" ? 1 : -1;

  const valOf = (field) => {
    if (field === "publishAt") return new Date(cursor.publishAt);
    if (field === "_id") return new mongoose.Types.ObjectId(cursor._id);
    return cursor[field];
  };

  const strictCmp = (field) => {
    const v = valOf(field);
    if (field === "_id") {
      return dir === 1 ? { _id: { $gt: v } } : { _id: { $lt: v } };
    }
    if (field === "publishAt") {
      return dir === 1 ? { publishAt: { $gt: v } } : { publishAt: { $lt: v } };
    }
    return dir === 1 ? { [field]: { $gt: v } } : { [field]: { $lt: v } };
  };

  const equality = (field) => {
    const v = valOf(field);
    return field === "publishAt"
      ? { publishAt: v }
      : field === "_id"
      ? { _id: v }
      : { [field]: v };
  };

  // OR of ladders: primary strict OR (primary eq AND tie1 strict) OR (primary eq, tie1 eq, tie2 strict) ... etc.
  const ladders = [];
  for (let i = 0; i <= parts.length; i++) {
    const strictField = i === 0 ? primary : parts[i - 1];
    const eqFields = i === 0 ? [] : [primary, ...parts.slice(0, i - 1)];
    ladders.push({ $and: [...eqFields.map(equality), strictCmp(strictField)] });
  }
  return { $or: ladders };
};

/* -------------------------------------------------------------
   Variant helpers
------------------------------------------------------------- */
const toCardVariant = async (variant) => {
  if (!variant) return null;
  const stock = await Inventory.findOne({ variant: variant._id })
    .select({ qty: 1, reserved: 1 })
    .lean();
  const inStock = (stock?.qty ?? 0) - (stock?.reserved ?? 0) > 0;
  const image =
    variant.images?.find?.((m) => m.role === "main")?.url ||
    variant.images?.[0]?.url ||
    null;
  return {
    sku: variant.sku,
    color: variant.options?.color ?? null,
    size: variant.options?.size ?? null,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice ?? null,
    image,
    inStock,
  };
};

const resolveDefaultVariant = async (product) => {
  if (!product) return null;
  if (product.defaultVariantSku) {
    const byDefault = await ProductVariant.findOne({
      product: product._id,
      sku: product.defaultVariantSku,
    }).lean();
    if (byDefault) return byDefault;
  }
  const variants = await ProductVariant.find({ product: product._id })
    .sort({ createdAt: 1 })
    .limit(12)
    .lean();
  for (const v of variants) {
    const stock = await Inventory.findOne({ variant: v._id })
      .select({ qty: 1, reserved: 1 })
      .lean();
    const inStock = (stock?.qty ?? 0) - (stock?.reserved ?? 0) > 0;
    if (inStock) return v;
  }
  return variants[0] ?? null;
};

const resolveInitialVariantForPDP = async (product, skuFromQuery) => {
  if (!product) return null;
  if (skuFromQuery) {
    const bySku = await ProductVariant.findOne({
      product: product._id,
      sku: String(skuFromQuery),
    }).lean();
    if (bySku) return bySku;
  }
  return resolveDefaultVariant(product);
};

/* -------------------------------------------------------------
   1) ALL PRODUCTS (cursor-based) + cardVariant + sorting
------------------------------------------------------------- */
export const getAllProducts = async (req, res) => {
  const limit = Math.min(60, Math.max(1, toNum(req.query.limit, 24)));
  const cursor = decodeCursor(req.query.cursor);
  const sortCfg = buildSort(req.query.sort);

  const key = cacheKeyFromReq(req, "prd:all:cursor");
  const cached = await cacheGet(key);
  if (cached) return res.json(cached);

  const after = afterBySort(cursor, sortCfg);
  const items = await Product.find(after)
    .select(listSelect)
    .sort(sortCfg.sort)
    .limit(limit)
    .lean();

  const last = items[items.length - 1];
  const nextCursor =
    items.length === limit
      ? encodeCursor({
          _id: last?._id,
          publishAt: last?.publishAt,
          basePrice: last?.basePrice,
          ratingAvg: last?.ratingAvg,
          ratingCount: last?.ratingCount,
          purchases: last?.purchases,
          clicks: last?.clicks,
        })
      : null;

  const withCardVariant = await Promise.all(
    items.map(async (p) => {
      const base = await resolveDefaultVariant(p);
      const cardVariant = await toCardVariant(base);
      return { ...p, cardVariant };
    })
  );

  const payload = { items: withCardVariant, nextCursor, limit };
  await cacheSet(key, payload, 60);
  res.json(payload);
};

/* -------------------------------------------------------------
   2) FILTERED PRODUCTS (cursor-based) + cardVariant + sorting
------------------------------------------------------------- */
export const getProductsByFilter = async (req, res) => {
  const limit = Math.min(60, Math.max(1, toNum(req.query.limit, 24)));
  const cursor = decodeCursor(req.query.cursor);
  const sortCfg = buildSort(req.query.sort);
  const filter = buildFilter(req.query);

  const key = cacheKeyFromReq(req, "prd:filter:cursor");
  const cached = await cacheGet(key);
  if (cached) return res.json(cached);

  const after = afterBySort(cursor, sortCfg);
  const items = await Product.find({ ...filter, ...after })
    .select(listSelect)
    .sort(sortCfg.sort)
    .limit(limit)
    .lean();

  const last = items[items.length - 1];
  const nextCursor =
    items.length === limit
      ? encodeCursor({
          _id: last?._id,
          publishAt: last?.publishAt,
          basePrice: last?.basePrice,
          ratingAvg: last?.ratingAvg,
          ratingCount: last?.ratingCount,
          purchases: last?.purchases,
          clicks: last?.clicks,
        })
      : null;

  const withCardVariant = await Promise.all(
    items.map(async (p) => {
      const base = await resolveDefaultVariant(p);
      const cardVariant = await toCardVariant(base);
      return { ...p, cardVariant };
    })
  );

  const payload = { items: withCardVariant, nextCursor, limit };
  await cacheSet(key, payload, 300);
  res.json(payload);
};

/* -------------------------------------------------------------
   3) SEARCH PRODUCTS (cursor-based) + cardVariant (relevance only)
------------------------------------------------------------- */
export const getProductsBySearch = async (req, res) => {
  const q = (req.query.q || "").trim();
  const limit = Math.min(60, Math.max(1, toNum(req.query.limit, 24)));
  const cursor = decodeCursor(req.query.cursor);

  const key = cacheKeyFromReq(req, "prd:search:cursor");
  const cached = await cacheGet(key);
  if (cached) return res.json(cached);

  if (!q) {
    const payload = { items: [], nextCursor: null, limit, q: "" };
    await cacheSet(key, payload, 30);
    return res.json(payload);
  }

  const find = { $text: { $search: q } };
  const after = afterByScore(cursor);

  const items = await Product.find({ ...find, ...after })
    .select({ ...listSelect, score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" }, _id: -1 })
    .limit(limit)
    .lean();

  const withCardVariant = await Promise.all(
    items.map(async (p) => {
      const base = await resolveDefaultVariant(p);
      const cardVariant = await toCardVariant(base);
      return { ...p, cardVariant };
    })
  );

  const nextCursor =
    items.length === limit
      ? encodeCursor({
          score: items[items.length - 1].score ?? 0,
          _id: items[items.length - 1]._id,
        })
      : null;

  const payload = { items: withCardVariant, nextCursor, limit, q };
  await cacheSet(key, payload, 60);
  res.json(payload);
};

/* -------------------------------------------------------------
   4) FACETS
------------------------------------------------------------- */
export const getFacets = async (req, res) => {
  const filter = buildFilter(req.query);
  const key = cacheKeyFromReq(req, "prd:facets");
  const cached = await cacheGet(key);
  if (cached) return res.json(cached);

  const [facet] = await Product.aggregate([
    { $match: filter },
    {
      $facet: {
        colors: [
          { $unwind: "$availableColors" },
          { $group: { _id: "$availableColors", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        sizes: [
          { $unwind: "$availableSizes" },
          { $group: { _id: "$availableSizes", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
        tags: [
          { $unwind: "$tags" },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 40 },
        ],
        publishRange: [
          {
            $group: {
              _id: null,
              min: { $min: "$publishAt" },
              max: { $max: "$publishAt" },
            },
          },
        ],
      },
    },
  ]);

  const payload = {
    colors: facet?.colors?.map((x) => ({ color: x._id, count: x.count })) ?? [],
    sizes: facet?.sizes?.map((x) => ({ size: x._id, count: x.count })) ?? [],
    tags: facet?.tags?.map((x) => ({ tag: x._id, count: x.count })) ?? [],
    publishRange: facet?.publishRange?.[0] ?? null,
  };

  await cacheSet(key, payload, 120);
  res.json(payload);
};

/* -------------------------------------------------------------
   5) NEW ARRIVALS (cursor-based) + cardVariant (still by publishAt)
------------------------------------------------------------- */
export const getNewArrivals = async (req, res) => {
  const limit = Math.min(60, Math.max(1, toNum(req.query.limit, 24)));
  const cursor = decodeCursor(req.query.cursor);
  const key = cacheKeyFromReq(req, "prd:new:cursor");
  const cached = await cacheGet(key);
  if (cached) return res.json(cached);

  const after = afterByPublish(cursor);
  const items = await Product.find(after)
    .select(listSelect)
    .sort({ publishAt: -1, _id: -1 })
    .limit(limit)
    .lean();

  const withCardVariant = await Promise.all(
    items.map(async (p) => {
      const base = await resolveDefaultVariant(p);
      const cardVariant = await toCardVariant(base);
      return { ...p, cardVariant };
    })
  );

  const nextCursor =
    items.length === limit
      ? encodeCursor({
          publishAt: items[items.length - 1].publishAt,
          _id: items[items.length - 1]._id,
        })
      : null;

  const payload = { items: withCardVariant, nextCursor, limit };
  await cacheSet(key, payload, 300);
  res.json(payload);
};

/* -------------------------------------------------------------
   6) FEATURED (cursor-based) + cardVariant (still by publishAt)
------------------------------------------------------------- */
export const getFeatured = async (req, res) => {
  const limit = Math.min(60, Math.max(1, toNum(req.query.limit, 24)));
  const cursor = decodeCursor(req.query.cursor);
  const key = cacheKeyFromReq(req, "prd:feat:cursor");
  const cached = await cacheGet(key);
  if (cached) return res.json(cached);

  const after = afterByPublish(cursor);
  const filter = { collections: { $in: ["featured"] } };
  const items = await Product.find({ ...filter, ...after })
    .select(listSelect)
    .sort({ publishAt: -1, _id: -1 })
    .limit(limit)
    .lean();

  const withCardVariant = await Promise.all(
    items.map(async (p) => {
      const base = await resolveDefaultVariant(p);
      const cardVariant = await toCardVariant(base);
      return { ...p, cardVariant };
    })
  );

  const nextCursor =
    items.length === limit
      ? encodeCursor({
          publishAt: items[items.length - 1].publishAt,
          _id: items[items.length - 1]._id,
        })
      : null;

  const payload = { items: withCardVariant, nextCursor, limit };
  await cacheSet(key, payload, 300);
  res.json(payload);
};

/* -------------------------------------------------------------
   7) TRENDING (unchanged priority, still paged by publishAt/_id)
------------------------------------------------------------- */
export const getTrending = async (req, res) => {
  const limit = Math.min(60, Math.max(1, toNum(req.query.limit, 24)));
  const cursor = decodeCursor(req.query.cursor);
  const cacheKey = cacheKeyFromReq(req, "prd:trending:cursor");
  const cached = await cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const after = afterByPublish(cursor);

  let items = await Product.find({ isTrending: true, ...after })
    .select(listSelect)
    .sort({ publishAt: -1, _id: -1 })
    .limit(limit)
    .lean();

  if (items.length < limit && items.length < 30) {
    const excludeIds = items.map((i) => i._id);
    const more = await Product.find({
      purchases: { $gte: 10 },
      _id: { $nin: excludeIds },
      ...after,
    })
      .select(listSelect)
      .sort({ purchases: -1, publishAt: -1, _id: -1 })
      .limit(limit - items.length)
      .lean();
    items = items.concat(more);
  }

  if (items.length < limit && items.length < 30) {
    const excludeIds = items.map((i) => i._id);
    const more = await Product.find({
      clicks: { $gt: 0 },
      _id: { $nin: excludeIds },
      ...after,
    })
      .select(listSelect)
      .sort({ clicks: -1, publishAt: -1, _id: -1 })
      .limit(limit - items.length)
      .lean();
    items = items.concat(more);
  }

  if (items.length < limit && items.length < 30) {
    const excludeIds = items.map((i) => i._id);
    const more = await Product.find({ _id: { $nin: excludeIds }, ...after })
      .select(listSelect)
      .sort({ publishAt: -1, _id: -1 })
      .limit(limit - items.length)
      .lean();
    items = items.concat(more);
  }

  const withCardVariant = await Promise.all(
    items.map(async (p) => {
      const base = await resolveDefaultVariant(p);
      const cardVariant = await toCardVariant(base);
      return { ...p, cardVariant };
    })
  );

  const nextCursor =
    items.length === limit
      ? encodeCursor({
          publishAt: items[items.length - 1].publishAt,
          _id: items[items.length - 1]._id,
        })
      : null;

  const payload = { items: withCardVariant, nextCursor, limit };
  await cacheSet(cacheKey, payload, 120);
  res.json(payload);
};

/* -------------------------------------------------------------
   8) PRODUCT DETAILS (variant-aware first paint)
------------------------------------------------------------- */
export const getProductDetails = async (req, res) => {
  const { idOrSlug } = req.params;
  const isAdmin = String(req.query.admin).toLowerCase() === "true";
  const requestedSku = (req.query.sku || "").trim() || null;

  const key = cacheKeyFromReq(
    req,
    `prd:detail:${idOrSlug}:${isAdmin ? "a" : "u"}`
  );
  const cached = await cacheGet(key);
  if (cached) return res.json(cached);

  const isId = mongoose.isValidObjectId(idOrSlug);
  const product = await Product.findOne(
    isId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() }
  ).lean();
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (!isAdmin) {
    await Product.updateOne({ _id: product._id }, { $inc: { clicks: 1 } });
  }

  const initialVariant = await resolveInitialVariantForPDP(
    product,
    requestedSku
  );
  if (!initialVariant) {
    return res
      .status(404)
      .json({ message: "No variants available for this product" });
  }
  const initial = await toCardVariant(initialVariant);
  const initialVariantSku = initial?.sku ?? null;

  const variants = await ProductVariant.find({ product: product._id }).lean();
  const inv = await Inventory.find({
    variant: { $in: variants.map((v) => v._id) },
  })
    .select({ variant: 1, qty: 1, reserved: 1, updatedAt: 1 })
    .lean();
  const invMap = new Map(inv.map((r) => [String(r.variant), r]));
  const variantsWithStock = variants.map((v) => ({
    ...v,
    stock: invMap.get(String(v._id)) ?? { qty: 0, reserved: 0 },
  }));

  const page = Math.max(1, toNum(req.query.page, 1));
  const limit = Math.min(50, Math.max(1, toNum(req.query.limit, 10)));
  const [reviews, reviewTotal] = await Promise.all([
    Review.find({ product: product._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments({ product: product._id }),
  ]);

  const payload = {
    product,
    initialVariantSku,
    initialVariant: initial,
    variants: variantsWithStock,
    reviews: { items: reviews, total: reviewTotal, page, limit },
  };

  await cacheSet(key, payload, 300);
  res.json(payload);
};

/* -------------------------------------------------------------
   9) VARIANT LOOKUP (SKU or productId+color+size)
------------------------------------------------------------- */
export const getVariantByKey = async (req, res) => {
  const { sku, productId, color, size } = req.query;
  if (!sku && !(productId && color && size)) {
    return res.status(400).json({
      message: "Provide ?sku=... OR ?productId=...&color=...&size=...",
    });
  }

  const key = cacheKeyFromReq(req, "var:lookup");
  const cached = await cacheGet(key);
  if (cached) return res.json(cached);

  const query = sku
    ? { sku: String(sku) }
    : {
        product: new mongoose.Types.ObjectId(productId),
        "options.color": String(color).toLowerCase(),
        "options.size": String(size).toUpperCase(),
      };

  const variant = await ProductVariant.findOne(query).lean();
  if (!variant) return res.status(404).json({ message: "Variant not found" });

  const [product, stock] = await Promise.all([
    Product.findById(variant.product)
      .select({ title: 1, slug: 1, coverImage: 1 })
      .lean(),
    Inventory.findOne({ variant: variant._id })
      .select({ qty: 1, reserved: 1 })
      .lean(),
  ]);

  const payload = {
    variant,
    product,
    stock: stock ?? { qty: 0, reserved: 0 },
  };
  await cacheSet(key, payload, 120);
  res.json(payload);
};

/* -------------------------------------------------------------
   Optional: explicit click tracker
------------------------------------------------------------- */
export const trackClick = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "Invalid product id" });
  await Product.updateOne({ _id: id }, { $inc: { clicks: 1 } });
  res.json({ ok: true });
};
