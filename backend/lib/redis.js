import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    tls: true,
  },
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

client.on("connect", () => console.log("✅ Redis connected"));
client.on("error", (err) => console.error("❌ Redis error", err));

await client.connect();
