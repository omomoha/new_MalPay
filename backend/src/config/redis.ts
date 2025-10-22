import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;

// Redis configuration for Railway
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        logger.error('Redis reconnection failed after 10 attempts');
        return new Error('Redis reconnection failed');
      }
      return Math.min(retries * 100, 3000);
    },
  },
};

// Connect to Redis
export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient(redisConfig);
    
    redisClient.on('error', (error) => {
      logger.error('Redis client error:', error);
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });
    
    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });
    
    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });
    
    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};

// Get Redis client
export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

// Redis helper functions
export const redisHelpers = {
  // Set key with expiration
  setex: async (key: string, seconds: number, value: string): Promise<void> => {
    await redisClient.setEx(key, seconds, value);
  },
  
  // Get key
  get: async (key: string): Promise<string | null> => {
    return await redisClient.get(key);
  },
  
  // Delete key
  del: async (key: string): Promise<number> => {
    return await redisClient.del(key);
  },
  
  // Check if key exists
  exists: async (key: string): Promise<boolean> => {
    return await redisClient.exists(key) === 1;
  },
  
  // Set key
  set: async (key: string, value: string): Promise<void> => {
    await redisClient.set(key, value);
  },
  
  // Increment key
  incr: async (key: string): Promise<number> => {
    return await redisClient.incr(key);
  },
  
  // Decrement key
  decr: async (key: string): Promise<number> => {
    return await redisClient.decr(key);
  },
  
  // Get multiple keys
  mget: async (keys: string[]): Promise<(string | null)[]> => {
    return await redisClient.mGet(keys);
  },
  
  // Set multiple keys
  mset: async (keyValuePairs: Record<string, string>): Promise<void> => {
    await redisClient.mSet(keyValuePairs);
  },
  
  // Get keys by pattern
  keys: async (pattern: string): Promise<string[]> => {
    return await redisClient.keys(pattern);
  },
  
  // Set hash field
  hset: async (key: string, field: string, value: string): Promise<void> => {
    await redisClient.hSet(key, field, value);
  },
  
  // Get hash field
  hget: async (key: string, field: string): Promise<string | undefined> => {
    return await redisClient.hGet(key, field);
  },
  
  // Get all hash fields
  hgetall: async (key: string): Promise<Record<string, string>> => {
    return await redisClient.hGetAll(key);
  },
  
  // Delete hash field
  hdel: async (key: string, field: string): Promise<number> => {
    return await redisClient.hDel(key, field);
  },
  
  // Add to set
  sadd: async (key: string, member: string): Promise<number> => {
    return await redisClient.sAdd(key, member);
  },
  
  // Remove from set
  srem: async (key: string, member: string): Promise<number> => {
    return await redisClient.sRem(key, member);
  },
  
  // Check if member exists in set
  sismember: async (key: string, member: string): Promise<boolean> => {
    return await redisClient.sIsMember(key, member);
  },
  
  // Get all set members
  smembers: async (key: string): Promise<string[]> => {
    return await redisClient.sMembers(key);
  },
  
  // Add to sorted set
  zadd: async (key: string, score: number, member: string): Promise<number> => {
    return await redisClient.zAdd(key, { score, value: member });
  },
  
  // Get sorted set range
  zrange: async (key: string, start: number, stop: number): Promise<string[]> => {
    return await redisClient.zRange(key, start, stop);
  },
  
  // Get sorted set range with scores
  zrangeWithScores: async (key: string, start: number, stop: number): Promise<Array<{ score: number; value: string }>> => {
    return await redisClient.zRangeWithScores(key, start, stop);
  },
  
  // Remove from sorted set
  zrem: async (key: string, member: string): Promise<number> => {
    return await redisClient.zRem(key, member);
  },
  
  // Get sorted set score
  zscore: async (key: string, member: string): Promise<number | null> => {
    return await redisClient.zScore(key, member);
  },
  
  // Get sorted set count
  zcard: async (key: string): Promise<number> => {
    return await redisClient.zCard(key);
  },
  
  // Publish message
  publish: async (channel: string, message: string): Promise<number> => {
    return await redisClient.publish(channel, message);
  },
  
  // Subscribe to channel
  subscribe: async (channel: string, callback: (message: string) => void): Promise<void> => {
    await redisClient.subscribe(channel, callback);
  },
  
  // Unsubscribe from channel
  unsubscribe: async (channel: string): Promise<void> => {
    await redisClient.unsubscribe(channel);
  },
};

// Close Redis connection
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};
