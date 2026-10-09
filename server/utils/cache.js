import Redis from 'ioredis';

let redisClient = null;
let redisEnabled = false;

/**
 * Initialize Redis Client
 */
export const initRedis = () => {
  // Temporarily disable Redis to prevent retry errors
  console.log('⚠️ Redis caching disabled (using MongoDB only)');
  redisEnabled = false;
  return null;
};

/**
 * Get Redis Client
 */
export const getRedisClient = () => {
  if (!redisEnabled) return null;
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
};

/**
 * Cache Get
 */
export const cacheGet = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return null;

    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Cache get error:', err);
    return null;
  }
};

/**
 * Cache Set
 */
export const cacheSet = async (key, value, ttl = 3600) => {
  try {
    const client = getRedisClient();
    if (!client) return false;

    await client.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('Cache set error:', err);
    return false;
  }
};

/**
 * Cache Delete
 */
export const cacheDelete = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return false;

    await client.del(key);
    return true;
  } catch (err) {
    console.error('Cache delete error:', err);
    return false;
  }
};

/**
 * Cache Clear Pattern
 */
export const cacheClearPattern = async (pattern) => {
  try {
    const client = getRedisClient();
    if (!client) return false;

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return true;
  } catch (err) {
    console.error('Cache clear pattern error:', err);
    return false;
  }
};
