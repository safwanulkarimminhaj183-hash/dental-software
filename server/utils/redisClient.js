import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let redisClient = null;
let isRedisConnected = false;

try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        // Stop retrying after 3 attempts if Redis service is not available locally
        return null;
      }
      return Math.min(times * 200, 1000);
    },
    enableOfflineQueue: false,
    connectTimeout: 2000,
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('⚡ [Redis] Successfully connected to Redis Cache Server.');
  });

  redisClient.on('error', (err) => {
    if (isRedisConnected) {
      console.warn('⚠️ [Redis] Error encountered:', err.message);
    }
    isRedisConnected = false;
  });

  redisClient.on('end', () => {
    isRedisConnected = false;
    console.log('ℹ️ [Redis] Connection closed. Falling back to MongoDB database.');
  });
} catch (error) {
  console.warn('⚠️ [Redis] Client initialization skipped/failed:', error.message);
  isRedisConnected = false;
}

/**
 * Get cached item by key
 */
export const getCache = async (key) => {
  if (!isRedisConnected || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`[Redis] getCache error for key ${key}:`, err.message);
    return null;
  }
};

/**
 * Set cached item with TTL (seconds)
 */
export const setCache = async (key, value, ttlSeconds = 3600) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    const serialized = JSON.stringify(value);
    await redisClient.set(key, serialized, 'EX', ttlSeconds);
    return true;
  } catch (err) {
    console.warn(`[Redis] setCache error for key ${key}:`, err.message);
    return false;
  }
};

/**
 * Delete single key or keys matching pattern
 */
export const deleteCachePattern = async (pattern) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`🧹 [Redis] Cleared ${keys.length} cached keys for pattern: ${pattern}`);
    }
    return true;
  } catch (err) {
    console.warn(`[Redis] deleteCachePattern error for pattern ${pattern}:`, err.message);
    return false;
  }
};

export const isRedisAvailable = () => isRedisConnected;

export default redisClient;
