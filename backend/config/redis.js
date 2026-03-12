const Redis = require("ioredis");
const dbgr = require("debug")("development:Redis");

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    if (times > 3) {
      dbgr("Redis: Max reconnection attempts reached. Continuing without Redis.");
      return null; 
    }
    return Math.min(times * 200, 1000);
  },
  connectTimeout: 5000,
});

redisClient.on("error", (error) => {
  if (error.code !== 'ECONNREFUSED') {
    dbgr("Redis Error:", error.message);
  }
});

redisClient.on("connect", () => {
  dbgr("✅ Redis Connected Successfully.");
});

const isRedisReady = () => redisClient.status === "ready";

module.exports = { redisClient, isRedisReady };