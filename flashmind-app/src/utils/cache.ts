// src/utils/cache.ts
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

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
