const { getDb } = require('../../config/db');
const { DELIVERY_STATUS } = require('../../utils/constants');
const { attemptDelivery } = require('../../services/dispatch.service');
const { scheduleRetry } = require('../../services/retry.service');

module.exports = async function processDelivery(job) {
  const { deliveryId } = job.data;
  const db = getDb();

  const delivery = await db('deliveries').where({ id: deliveryId }).first();
  if (!delivery) {
    return;
  }
  if (delivery.status === DELIVERY_STATUS.SUCCESS || delivery.status === DELIVERY_STATUS.DISABLED) {
    return;
  }

  const result = await attemptDelivery(deliveryId);

  // On failure, schedule retry if under max retries
  if (!result.ok) {
    const nextAttempt = (delivery.attempt_count || 0) + 1;
    await scheduleRetry(deliveryId, nextAttempt + 1);
  }
};
