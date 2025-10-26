const { Worker } = require('bullmq');
const { redis } = require('./config/redis');
const { config } = require('./config/env');
const logger = require('./config/logger');
const { QUEUE_NAMES } = require('./utils/constants');
const processDelivery = require('./queue/workers/deliveryWorker');

const worker = new Worker(
  QUEUE_NAMES.DELIVERY,
  async (job) => processDelivery(job),
  {
    connection: redis.options,
    concurrency: config.queueConcurrency
  }
);

worker.on('ready', () => logger.info('Delivery worker ready'));
worker.on('completed', (job) => logger.info({ jobId: job.id }, 'Delivery job completed'));
worker.on('failed', (job, err) => logger.warn({ jobId: job?.id, err }, 'Delivery job failed'));

process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});
