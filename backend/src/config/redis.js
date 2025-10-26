const Redis = require('ioredis');
const { config } = require('./env');
const logger = require('./logger');

const redis = new Redis(config.redisUrl, {
  lazyConnect: false,
  enableReadyCheck: true,
  maxRetriesPerRequest: null
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));

module.exports = { redis };
