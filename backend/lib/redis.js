import { createClient } from "redis";
const useTLS = (process.env.REDIS_TLS || "false").toLowerCase() === "true";

export const redis = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || undefined,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT || 6379),
    tls: useTLS ? { servername: process.env.REDIS_HOST } : undefined,
  },
});

redis.on("ready", () => console.log("Redis Connected........"));
redis.on("error", (e) => console.error(" Redis error", e));

export async function connectRedis() {
  if (!redis.isOpen) await redis.connect();
  await redis.set("foo", "bar");
  console.log("foo =", await redis.get("foo"));
}
