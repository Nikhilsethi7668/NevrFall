import Product from "../Models/Product.js";
import WishlistItem from "../Models/WishlistItem.js";
import { redis } from "../lib/redis.js";

const WL_TTL = 120;
const wlKey = (userId) => `wl:${userId}`;

async function getCachedWishlist(userId) {
  try {
    if (!redis) return null;
    const cached = await redis.get(wlKey(userId));
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.warn("getCachedWishlist error:", err?.message);
    return null;
  }
}
async function setCachedWishlist(userId, payload, ttl = WL_TTL) {
  try {
    if (!redis) return;
    await redis.set(wlKey(userId), JSON.stringify(payload), 'EX', ttl);
  } catch (err) {
    console.warn("setCachedWishlist error:", err?.message);
  }
}
async function invalidateWishlist(userId) {
  try {
    if (!redis) return;
    await redis.del(wlKey(userId));
  } catch (err) {
    console.warn("invalidateWishlist error:", err?.message);
  }
}

async function queryWishlistFromDB(userId) {
  const items = await WishlistItem.find({ user: userId })
    .populate({
      path: "product",
      select:
        "title slug color colorLabel coverImage priceFrom compareAtFrom inStock currency",
    })
    .lean();
  return { items };
}

async function refreshWishlistCache(userId) {
  await invalidateWishlist(userId);
  const payload = await queryWishlistFromDB(userId);
  await setCachedWishlist(userId, payload);
  return payload;
}

export async function getWishlist(req, res) {
  const userId = req.user?._id || req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const forceFresh =
    String(req.query.fresh || "").toLowerCase() === "1" ||
    String(req.query.fresh || "").toLowerCase() === "true";

  if (forceFresh) {
    const payload = await refreshWishlistCache(userId);
    return res.json(payload);
  }

  const cached = await getCachedWishlist(userId);
  if (cached) return res.json(cached);

  const payload = await queryWishlistFromDB(userId);
  await setCachedWishlist(userId, payload);
  return res.json(payload);
}


export async function addToWishlist(req, res) {
  console.log("req.user", req.user);
  console.log("req.body", req.body);
  const userId = req.user?._id || req.user?.id;
  const { productId } = req.body || {};
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!productId)
    return res.status(400).json({ error: "productId is required" });

  const prod = await Product.findById(productId).select("_id");
  if (!prod) return res.status(404).json({ error: "Product not found" });

  const doc = await WishlistItem.findOneAndUpdate(
    { user: userId, product: productId },
    {
      $setOnInsert: { user: userId, product: productId, addedAt: new Date() },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  // LIVE refresh (invalidate -> read DB -> set cache)
  const wishlist = await refreshWishlistCache(userId);

  return res.json({ added: true, item: doc, ...wishlist });
}

export async function removeFromWishlist(req, res) {
  const userId = req.user?._id || req.user?.id;
  const { itemId, productId } = req.body || {};
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const filter = itemId
    ? { _id: itemId, user: userId }
    : productId
      ? { user: userId, product: productId }
      : null;

  if (!filter)
    return res.status(400).json({ error: "Provide itemId or productId" });

  const deleted = await WishlistItem.findOneAndDelete(filter).lean();
  if (!deleted)
    return res.status(404).json({ error: "Wishlist item not found" });

  // LIVE refresh (invalidate -> read DB -> set cache)
  const wishlist = await refreshWishlistCache(userId);

  return res.json({ removed: true, item: deleted, ...wishlist });
}

// Merge guest wishlist with user wishlist (called during login/signup)
export async function mergeGuestWishlist(userId, guestProductIds = []) {
  try {
    if (!guestProductIds || guestProductIds.length === 0) {
      return { success: true, wishlist: null };
    }

    // Validate product IDs and check if they exist
    const validProductIds = [];
    for (const productId of guestProductIds) {
      if (!productId) continue;

      const product = await Product.findById(productId).select("_id");
      if (product) {
        validProductIds.push(productId);
      }
    }

    if (validProductIds.length === 0) {
      return { success: true, wishlist: null, message: "No valid guest items to merge" };
    }

    // Get existing wishlist items for this user
    const existingItems = await WishlistItem.find({ user: userId }).select("product").lean();
    const existingProductIds = new Set(existingItems.map(item => item.product.toString()));

    // Filter out duplicates - only add products not already in wishlist
    const newProductIds = validProductIds.filter(
      productId => !existingProductIds.has(productId.toString())
    );

    if (newProductIds.length === 0) {
      return { success: true, wishlist: null, message: "All guest items already in wishlist" };
    }

    // Add new items to wishlist
    const wishlistItems = newProductIds.map(productId => ({
      user: userId,
      product: productId,
      addedAt: new Date(),
    }));

    await WishlistItem.insertMany(wishlistItems);

    // Refresh cache and return updated wishlist
    const wishlist = await refreshWishlistCache(userId);

    return { success: true, wishlist, addedCount: newProductIds.length };
  } catch (error) {
    console.error("Error merging guest wishlist:", error);
    return { success: false, error: error.message };
  }
}
