// backend/caching/cacheService.js
// Redis caching for performance optimization
const redis = require('redis');
const { promisify } = require('util');

class CacheService {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    });

    this.get = promisify(this.client.get).bind(this.client);
    this.set = promisify(this.client.set).bind(this.client);
    this.del = promisify(this.client.del).bind(this.client);
    this.expire = promisify(this.client.expire).bind(this.client);
  }

  async cacheLeaderboard(scope, category, data, ttl = 300) {
    const key = `leaderboard:${scope}:${category}`;
    await this.set(key, JSON.stringify(data));
    await this.expire(key, ttl);
  }

  async getLeaderboard(scope, category) {
    const key = `leaderboard:${scope}:${category}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async cacheMealPlan(userId, data, ttl = 3600) {
    const key = `meal_plan:${userId}`;
    await this.set(key, JSON.stringify(data));
    await this.expire(key, ttl);
  }

  async getMealPlan(userId) {
    const key = `meal_plan:${userId}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }
}

module.exports = new CacheService();
