import Redis from "ioredis";

const useTLS = (process.env.REDIS_TLS || "false").toLowerCase() === "true";

const getRedisConfig = () => ({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || undefined,
  tls: useTLS ? { servername: process.env.REDIS_HOST } : undefined,
  enableReadyCheck: true,
  lazyConnect: false,
});

// Lazy initialization
let _redis = null;
let _redisBullMQ = null;

export const getRedis = () => {
  if (!_redis) {
    _redis = new Redis({
      ...getRedisConfig(),
      maxRetriesPerRequest: 2,
    });
    _redis.on("connect", () => console.log("Redis connected"));
    _redis.on("ready", () => console.log("Redis ready"));
    _redis.on("error", (e) => console.error("Redis error", e));
  }

  return _redis;
};

export const getRedisBullMQ = () => {
  if (!_redisBullMQ) {
    _redisBullMQ = new Redis({
      ...getRedisConfig(),
      maxRetriesPerRequest: null,
    });
    _redisBullMQ.on("connect", () => console.log("BullMQ Redis connected"));
    _redisBullMQ.on("ready", () => console.log("BullMQ Redis ready"));
    _redisBullMQ.on("error", (e) => console.error("BullMQ Redis error", e));
  }
  return _redisBullMQ;
};

export const redis = getRedis();

export const redisBullMQ = getRedisBullMQ();

//Helper function to test connection
export async function connectRedis() {
  try {
    const r = getRedis();
    await r.set("foo", "bar");
    console.log("foo =", await r.get("foo"));
  } catch (err) {
    console.warn("Redis unavailable, caching disabled");
    // Silently fail - app will work without cache
  }
}
