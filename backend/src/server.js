const http = require('http');
const app = require('./index');
const logger = require('./config/logger');
const { initDb } = require('./config/db');
const { redis } = require('./config/redis');

const PORT = process.env.PORT || 8080;

async function start() {
  await initDb();
  const server = http.createServer(app);

  server.listen(PORT, () => {
    logger.info({ port: PORT }, 'API server listening');
  });

  const shutdown = async () => {
    logger.info('Shutting down server...');
    server.close(() => {
      logger.info('HTTP server closed');
    });
    try {
      await redis.quit();
      logger.info('Redis connection closed');
    } catch (e) {
      logger.warn({ err: e }, 'Redis close error');
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
