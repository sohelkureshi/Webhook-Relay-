require('dotenv').config();

function requireEnv(name) {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required env: ${name}`);
  }
  return val;
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8080', 10),
  adminApiKey: requireEnv('ADMIN_API_KEY'),
  internalApiKey: requireEnv('INTERNAL_API_KEY'),
  databaseUrl: requireEnv('DATABASE_URL'),
  redisUrl: requireEnv('REDIS_URL'),
  hmacGlobalFallbackSecret: requireEnv('HMAC_GLOBAL_FALLBACK_SECRET'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '5', 10),
  queueConcurrency: parseInt(process.env.QUEUE_CONCURRENCY || '10', 10),
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '8000', 10),
  serviceName: process.env.SERVICE_NAME || 'algohire-webhook-relay'
};

module.exports = { config };
