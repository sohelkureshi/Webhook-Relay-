const { Queue } = require('bullmq');
const { redis } = require('../config/redis');
const { QUEUE_NAMES } = require('../utils/constants');

const deliveryQueue = new Queue(QUEUE_NAMES.DELIVERY, {
  connection: redis.options
});

async function enqueueDelivery(deliveryId, delayMs = 0) {
  await deliveryQueue.add('deliver', { deliveryId }, { delay: delayMs, removeOnComplete: true, removeOnFail: false });
}

module.exports = { deliveryQueue, enqueueDelivery };
