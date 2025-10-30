import mongoose from "mongoose";
import Product from "../Models/Product.js";
import Cart from "../Models/Cart.js";
import { cacheGet, cacheSet, cacheKeyFromReq } from "../lib/cache.js";

export const getRecommendationsByProductId = async (req, res) => {
  const { productId } = req.params;

  try {
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    // Get product to determine category
    const product = await Product.findById(productId)
      .select({ primaryCategoryId: 1 })
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const categoryId = product.primaryCategoryId;
    if (!categoryId) {
      return res.json({ items: [], count: 0 });
    }

    // Limit up to 20 results
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));

    // Exclude current product
    const excludedId = new mongoose.Types.ObjectId(productId);

    // Common fields and sorting
    const baseQuerySelect = {
      title: 1,
      slug: 1,
      color: 1,
      colorLabel: 1,
      coverImage: 1,
      images: 1,
      priceFrom: 1,
      compareAtFrom: 1,
      inStock: 1,
      availableSizes: 1,
      currency: 1,
      publishAt: 1,
      purchases: 1,
      clicks: 1,
      parent: 1,
    };
    const sortSpec = { purchases: -1, clicks: -1, publishAt: -1, _id: -1 };

    // Get products with same primaryCategoryId
    const recommendations = await Product.find({
      primaryCategoryId: categoryId,
      _id: { $ne: excludedId },
    })
      .select(baseQuerySelect)
      .sort(sortSpec)
      .limit(limit)
      .lean();

    return res.json({ items: recommendations, count: recommendations.length });
  } catch (error) {
    console.error("Error getting recommendations by product id:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getRecommendationsForUserCart = async (req, res) => {
  try {
    // assume user id is available as req.user._id; adjust if different
    const userId = req.user && req.user._id ? String(req.user._id) : null;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // limit param default 30, cap 30
    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 30));

    // caching key (uses the provided helper)
    const cacheKey = cacheKeyFromReq(req, `cart_recs:${userId}`);

    // Try to get from cache
    const cached = await cacheGet(cacheKey);
    if (
      cached &&
      Array.isArray(cached.items) &&
      cached.items.length >= Math.min(1, limit)
    ) {
      // If the cached value was computed for a different limit that's okay,
      // we will slice it to requested limit below.
      const sliced = cached.items.slice(0, limit);
      return res.json({ items: sliced, count: sliced.length });
    }

    // Load user's cart
    const cart = await Cart.findOne({ user: userId }).lean();

    // gather product ids from cart (exclude invalid)
    const cartProductIds = (cart?.items || [])
      .map((it) =>
        mongoose.isValidObjectId(it.product) ? String(it.product) : null
      )
      .filter(Boolean)
      .map((id) => new mongoose.Types.ObjectId(id));

    // Fields to return & sorting
    const baseQuerySelect = {
      title: 1,
      slug: 1,
      color: 1,
      colorLabel: 1,
      coverImage: 1,
      images: 1,
      priceFrom: 1,
      compareAtFrom: 1,
      inStock: 1,
      availableSizes: 1,
      currency: 1,
      publishAt: 1,
      purchases: 1,
      clicks: 1,
      parent: 1,
      primaryCategoryId: 1,
    };
    const sortSpec = { publishAt: -1, purchases: -1, clicks: -1, _id: -1 };

    // If cart is empty => recommend site-wide (newest/popular)
    if (!cartProductIds.length) {
      const siteWide = await Product.find({ _id: { $nin: [] } })
        .select(baseQuerySelect)
        .sort(sortSpec)
        .limit(limit)
        .lean();

      // cache for 5 minutes
      await cacheSet(cacheKey, { items: siteWide }, 300);

      return res.json({ items: siteWide, count: siteWide.length });
    }

    // 1) fetch primaryCategoryId for cart products
    const cartProducts = await Product.find(
      { _id: { $in: cartProductIds } },
      { primaryCategoryId: 1 }
    ).lean();

    const categoryIds = [
      ...new Set(
        cartProducts
          .map((p) =>
            p.primaryCategoryId ? String(p.primaryCategoryId) : null
          )
          .filter(Boolean)
      ),
    ];

    // Exclude cart product ids from recommendations
    const excludedIds = cartProductIds.slice(); // already ObjectId

    let recommendations = [];

    // 2) fetch products from same categories first (exclude cart items)
    if (categoryIds.length) {
      recommendations = await Product.find({
        primaryCategoryId: { $in: categoryIds },
        _id: { $nin: excludedIds },
      })
        .select(baseQuerySelect)
        .sort(sortSpec)
        .limit(limit)
        .lean();
    }

    // 3) If still under limit, fill with products from other categories/site-wide
    if (recommendations.length < limit) {
      // Build exclusion set: cart items + already recommended
      const alreadyRecommendedIds = new Set(
        recommendations.map((p) => String(p._id))
      );
      excludedIds.forEach((id) => alreadyRecommendedIds.add(String(id)));

      const remaining = limit - recommendations.length;

      const filler = await Product.find({
        _id: {
          $nin: Array.from(alreadyRecommendedIds).map(
            (id) => new mongoose.Types.ObjectId(id)
          ),
        },
      })
        .select(baseQuerySelect)
        .sort(sortSpec)
        .limit(remaining)
        .lean();

      recommendations = recommendations.concat(filler);
    }

    // Cache results for 5 minutes (300 seconds)
    await cacheSet(cacheKey, { items: recommendations }, 300);

    return res.json({
      items: recommendations.slice(0, limit),
      count: Math.min(recommendations.length, limit),
    });
  } catch (error) {
    console.error("Error getting cart recommendations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
