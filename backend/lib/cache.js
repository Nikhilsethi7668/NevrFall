import { redis } from "./redis.js";

export const cacheGet = async (key) => {
  try {
    if (!redis) return null;
    const v = await redis.get(key);
    return v ? JSON.parse(v) : null;
  } catch (err) {
    console.warn("cacheGet error:", err?.message || err);
    return null; // Gracefully fail - app works without cache
  }
};

export const cacheSet = async (key, value, ttlSeconds = 60) => {
  try {
    if (!redis) return false;
    const str = typeof value === "string" ? value : JSON.stringify(value);
    ttlSeconds = Number(ttlSeconds) || 0;
    if (ttlSeconds > 0) {
      await redis.set(key, str, "EX", ttlSeconds);
    } else {
      await redis.set(key, str);
    }
    return true;
  } catch (err) {
    console.warn("cacheSet error:", err?.message || err);
    return false; // Gracefully fail - app works without cache
  }
};
export async function cacheDel(key) {
  if (!key) return false;
  try {
    if (!redis) return false;
    // redis.del returns number of keys removed
    const deleted = await redis.del(key);
    return Boolean(deleted && deleted > 0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("cacheDel error", err?.message || err);
    return false;
  }
}

export const cacheDelPattern = async (pattern) => {
  try {
    if (!redis) return false;
    const stream = redis.scanStream({ match: pattern, count: 500 });
    const batch = [];
    await new Promise((resolve, reject) => {
      stream.on("data", async (keys) => {
        if (!keys.length) return;
        batch.push(...keys);
        if (batch.length >= 500) {
          const chunk = batch.splice(0, batch.length);
          await redis.del(...chunk);
        }
      });
      stream.on("end", async () => {
        if (batch.length) await redis.del(...batch);
        resolve();
      });
      stream.on("error", reject);
    });
    return true;
  } catch (err) {
    console.warn("cacheDelPattern error:", err?.message || err);
    return false;
  }
};

export const cacheKeyFromReq = (req, prefix) =>
  `${prefix}:${req.originalUrl.replace(/\W+/g, ":")}`.toLowerCase();
