/**
 * Redis Cache Utility
 * Centralized caching for sessions, leaderboards, and temporary data
 * Falls back to in-memory storage if Redis is unavailable
 */

const Redis = require("ioredis");
const createLogger = require("./logger");

class RedisClient {
  constructor(serviceName) {
    this.logger = createLogger(serviceName);
    this.client = null;
    this.isConnected = false;
    this.useInMemory = false;
    this.memoryStore = new Map(); // In-memory fallback
  }

  connect(redisUrl = process.env.REDIS_URL || "redis://localhost:6379") {
    try {
      let redisConfig;

      // Priority 1: REDIS_URL (Standard Redis Cloud/Remote connection)
      if (
        process.env.REDIS_URL &&
        process.env.REDIS_URL !== "redis://localhost:6379"
      ) {
        this.logger.info("Attempting to connect to Redis Cloud...");

        try {
          const url = new URL(process.env.REDIS_URL);

          redisConfig = {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: url.password || undefined,
            username: url.username !== "default" ? url.username : undefined,
            tls:
              url.protocol === "rediss:"
                ? {
                    rejectUnauthorized: false,
                  }
                : undefined,
            maxRetriesPerRequest: 3,
            enableReadyCheck: false,
            connectTimeout: 10000,
            lazyConnect: true,
            retryStrategy: (times) => {
              if (times > 3) {
                this.logger.warn(
                  "Max Redis retries reached, switching to in-memory"
                );
                this.switchToInMemory();
                return null;
              }
              const delay = Math.min(times * 100, 2000);
              return delay;
            },
          };

          this.client = new Redis(redisConfig);
        } catch (urlError) {
          this.logger.warn("Invalid Redis URL, trying next option");
        }
      }

      // Priority 2: Upstash Redis (has limits)
      if (
        !this.client &&
        process.env.UPSTASH_REDIS_URL &&
        process.env.UPSTASH_REDIS_TOKEN
      ) {
        this.logger.info("Attempting to connect to Upstash Redis (cloud)...");

        try {
          const url = new URL(process.env.UPSTASH_REDIS_URL);

          redisConfig = {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: process.env.UPSTASH_REDIS_TOKEN,
            tls: {
              rejectUnauthorized: false,
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: false,
            connectTimeout: 10000,
            lazyConnect: true,
            retryStrategy: (times) => {
              if (times > 3) {
                this.logger.warn(
                  "Max Redis retries reached, switching to in-memory"
                );
                this.switchToInMemory();
                return null;
              }
              const delay = Math.min(times * 100, 2000);
              return delay;
            },
          };

          this.client = new Redis(redisConfig);
        } catch (urlError) {
          this.logger.warn("Invalid Upstash URL, falling back to local Redis");
        }
      }

      // Priority 3: Fallback to local Redis
      if (!this.client) {
        this.logger.info("Attempting to connect to local Redis...");

        this.client = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: false,
          connectTimeout: 5000,
          lazyConnect: true,
          retryStrategy: (times) => {
            if (times > 2) {
              this.logger.warn(
                "Local Redis unavailable, switching to in-memory"
              );
              this.switchToInMemory();
              return null;
            }
            return Math.min(times * 100, 1000);
          },
        });
      }

      this.client.on("connect", () => {
        this.isConnected = true;
        this.useInMemory = false;
        this.logger.info("Redis client connected");
      });

      this.client.on("ready", () => {
        this.isConnected = true;
        this.useInMemory = false;
        this.logger.info("Redis client ready");
      });

      this.client.on("error", (err) => {
        // Handle specific errors that indicate Redis is unavailable
        if (
          err.code === "ENOTFOUND" ||
          err.code === "ECONNREFUSED" ||
          err.code === "ETIMEDOUT" ||
          err.code === "ECONNRESET" ||
          err.message?.includes("ECONNREFUSED")
        ) {
          if (!this.useInMemory) {
            this.logger.warn(
              `Redis unavailable (${err.code}), switching to in-memory mode`
            );
            this.switchToInMemory();
          }
          // Suppress further error logging in in-memory mode
        } else if (!this.useInMemory) {
          this.logger.error("Redis connection error:", err.message);
        }
      });

      this.client.on("close", () => {
        this.logger.info("Redis connection closed");
        this.isConnected = false;
      });

      this.client.on("reconnecting", (delay) => {
        this.logger.info(`Redis reconnecting in ${delay}ms...`);
      });

      // Try to connect
      this.client.connect().catch((err) => {
        this.logger.warn("Initial Redis connection failed:", err.message);
        this.switchToInMemory();
      });

      return this.client;
    } catch (error) {
      this.logger.error("Failed to initialize Redis:", error.message);
      this.switchToInMemory();
      return null;
    }
  }

  switchToInMemory() {
    this.useInMemory = true;
    this.isConnected = false;
    if (this.client) {
      try {
        // Remove all listeners to stop error logging
        this.client.removeAllListeners();
        // Disconnect immediately without retry
        this.client.disconnect(false);
      } catch (e) {
        // Ignore disconnect errors
      }
      this.client = null;
    }
    this.logger.info(
      "⚠️ Running in IN-MEMORY mode (cache will not persist across restarts)"
    );
  }

  async get(key) {
    try {
      if (this.useInMemory) {
        const item = this.memoryStore.get(key);
        if (item && item.expiry && Date.now() > item.expiry) {
          this.memoryStore.delete(key);
          return null;
        }
        return item ? item.value : null;
      }

      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Redis GET error for key ${key}:`, error.message);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      if (this.useInMemory) {
        this.memoryStore.set(key, {
          value: typeof value === "string" ? JSON.parse(value) : value,
          expiry: ttl ? Date.now() + ttl * 1000 : null,
        });
        return true;
      }

      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      this.logger.error(`Redis SET error for key ${key}:`, error.message);
      return false;
    }
  }

  async delete(key) {
    try {
      if (this.useInMemory) {
        this.memoryStore.delete(key);
        return true;
      }

      await this.client.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Redis DELETE error for key ${key}:`, error.message);
      return false;
    }
  }

  async exists(key) {
    try {
      if (this.useInMemory) {
        const item = this.memoryStore.get(key);
        if (item && item.expiry && Date.now() > item.expiry) {
          this.memoryStore.delete(key);
          return false;
        }
        return this.memoryStore.has(key);
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXISTS error for key ${key}:`, error.message);
      return false;
    }
  }

  async increment(key, amount = 1) {
    try {
      if (this.useInMemory) {
        const item = this.memoryStore.get(key);
        const currentValue = item
          ? typeof item.value === "number"
            ? item.value
            : 0
          : 0;
        const newValue = currentValue + amount;
        this.memoryStore.set(key, {
          value: newValue,
          expiry: item?.expiry || null,
        });
        return newValue;
      }

      return await this.client.incrby(key, amount);
    } catch (error) {
      this.logger.error(`Redis INCREMENT error for key ${key}:`, error.message);
      return null;
    }
  }

  async expire(key, seconds) {
    try {
      if (this.useInMemory) {
        const item = this.memoryStore.get(key);
        if (item) {
          item.expiry = Date.now() + seconds * 1000;
        }
        return true;
      }

      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      this.logger.error(`Redis EXPIRE error for key ${key}:`, error.message);
      return false;
    }
  }

  async flushPattern(pattern) {
    try {
      if (this.useInMemory) {
        const regex = new RegExp(pattern.replace(/\*/g, ".*"));
        let count = 0;
        for (const key of this.memoryStore.keys()) {
          if (regex.test(key)) {
            this.memoryStore.delete(key);
            count++;
          }
        }
        return count;
      }

      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return keys.length;
    } catch (error) {
      this.logger.error(
        `Redis FLUSH PATTERN error for ${pattern}:`,
        error.message
      );
      return 0;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      this.logger.info("Redis disconnected gracefully");
    }
  }

  isHealthy() {
    if (this.useInMemory) {
      return true; // In-memory is always "healthy"
    }
    return this.isConnected && this.client && this.client.status === "ready";
  }

  getStatus() {
    return {
      mode: this.useInMemory ? "in-memory" : "redis",
      connected: this.isConnected,
      healthy: this.isHealthy(),
      memorySize: this.useInMemory ? this.memoryStore.size : null,
    };
  }
}

module.exports = RedisClient;
