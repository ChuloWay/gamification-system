import IORedis from "ioredis";
import { logger, errorLog } from "./shared/logger";
import Redis from "ioredis";

// Create a new Redis client instance
const redisClient = new Redis({
  host: "127.0.0.1",
  port: 6379, // Redis server port
});

// Event listeners for logging and error handling
redisClient.on("connect", () => {
  logger.info("Connected to Redis");
});

redisClient.on("error", (error: any) => {
  //   errorLog('Redis Client Error:', error);
});

// Export the Redis client instance
export default redisClient;
