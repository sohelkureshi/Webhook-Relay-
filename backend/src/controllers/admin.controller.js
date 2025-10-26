const { getDb } = require('../config/db');
const { enqueueDelivery } = require('../queue/bullmq');
const metrics = require('../metrics/metrics');

async function listDeliveries(req, res, next) {
  try {
    const { status, subscription_id, event_id, limit = 50, offset = 0 } = req.query;
    const db = getDb();
    const q = db('deliveries').orderBy('created_at', 'desc').limit(limit).offset(offset);
    if (status) q.where({ status });
    if (subscription_id) q.where({ subscription_id });
    if (event_id) q.where({ event_id });
    const data = await q;
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

async function retryDelivery(req, res, next) {
  try {
    const { id } = req.params;
    const db = getDb();
    const delivery = await db('deliveries').where({ id }).first();
    if (!delivery) return res.status(404).json({ error: 'NotFound' });
    await enqueueDelivery(id, 0);
    res.status(202).json({ enqueued: true });
  } catch (e) {
    next(e);
  }
}

function metricsSnapshot(req, res) {
  res.json(metrics.snapshot());
}

module.exports = { listDeliveries, retryDelivery, metricsSnapshot };
