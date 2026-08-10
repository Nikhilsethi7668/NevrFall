import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();


const useTLS = (process.env.REDIS_TLS || "false").toLowerCase() === "true";

const getRedisConfig = () => ({
  host: "redis-12670.c12.us-east-1-4.ec2.cloud.redislabs.com",
  port: Number(12670),
  username: "default",
  password: "d2TlwTsaqXqhLNkjlhZoS8wUv8DkU6Cd",
  tls: useTLS ? { servername: "redis-12670.c12.us-east-1-4.ec2.cloud.redislabs.com" } : undefined,
  enableReadyCheck: true,
  lazyConnect: false,
});

console.log(JSON.stringify(getRedisConfig(), null, 2));

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
