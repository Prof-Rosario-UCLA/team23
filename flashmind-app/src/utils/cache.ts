// src/utils/cache.ts
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) throw new Error("REDIS_URL not set");

// 1) Create and configure a Redis client
const redisClient = createClient({ url: REDIS_URL });

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

redisClient.connect()
  .then(() => {
    console.log("✅ Redis connected");
  })
  .catch((err) => {
    console.error("❌ Redis connection failed:", err);
  });

export default redisClient;
