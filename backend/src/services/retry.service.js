// const { enqueueDelivery } = require('../queue/bullmq');
// const { config } = require('../config/env');
// const metrics = require('../metrics/metrics');

// function backoffDelay(attempt) {
//   // exponential backoff with jitter: base 2^attempt * 1000ms
//   const base = Math.pow(2, Math.max(0, attempt - 1)) * 1000;
//   const jitter = Math.floor(Math.random() * 250);
//   return base + jitter;
// }

// async function scheduleRetry(deliveryId, nextAttemptNumber) {
//   if (nextAttemptNumber > config.maxRetries) return false;
//   const delay = backoffDelay(nextAttemptNumber);
//   await enqueueDelivery(deliveryId, delay);
//   metrics.inc('retries_scheduled', 1);
//   return true;
// }

// module.exports = { scheduleRetry, backoffDelay };



// backend/src/services/retry.service.js
const { enqueueDelivery } = require('../queue/bullmq');
const { config } = require('../config/env');
const metrics = require('../metrics/metrics');

function backoffDelay(attempt) {
  const base = Math.pow(2, Math.max(0, attempt - 1)) * 1000;
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

async function scheduleRetry(deliveryId, nextAttemptNumber) {
  if (nextAttemptNumber > config.maxRetries) return false;
  const delay = backoffDelay(nextAttemptNumber);
  await enqueueDelivery(deliveryId, delay);
  await metrics.inc('retries_scheduled', 1);
  return true;
}

module.exports = { scheduleRetry, backoffDelay };
