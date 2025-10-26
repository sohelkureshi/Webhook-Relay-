// // const express = require('express');
// // const { requireAdminAuth } = require('../middlewares/auth');
// // const { getDb } = require('../config/db');
// // const { enqueueDelivery } = require('../queue/bullmq');
// // const metrics = require('../metrics/metrics');

// // const router = express.Router();

// // router.get('/deliveries', requireAdminAuth, async (req, res, next) => {
// //   try {
// //     const { status, subscription_id, event_id, limit = 50, offset = 0 } = req.query;
// //     const db = getDb();
// //     const q = db('deliveries').orderBy('created_at', 'desc').limit(limit).offset(offset);
// //     if (status) q.where({ status });
// //     if (subscription_id) q.where({ subscription_id });
// //     if (event_id) q.where({ event_id });
// //     const data = await q;
// //     res.json({ data });
// //   } catch (e) {
// //     next(e);
// //   }
// // });

// // router.post('/deliveries/:id/retry', requireAdminAuth, async (req, res, next) => {
// //   try {
// //     const { id } = req.params;
// //     const db = getDb();
// //     const delivery = await db('deliveries').where({ id }).first();
// //     if (!delivery) return res.status(404).json({ error: 'NotFound' });
// //     await enqueueDelivery(id, 0);
// //     res.status(202).json({ enqueued: true });
// //   } catch (e) {
// //     next(e);
// //   }
// // });

// // router.get('/metrics', requireAdminAuth, (req, res) => {
// //   res.json(metrics.snapshot());
// // });

// // module.exports = { router };
// const express = require('express');
// const { requireAdminAuth } = require('../middlewares/auth');
// const { getDb } = require('../config/db');
// const { enqueueDelivery } = require('../queue/bullmq');
// const metrics = require('../metrics/metrics');

// const ALLOWED_STATUS = new Set(['PENDING', 'SUCCESS', 'FAILED', 'DISABLED']);

// const router = express.Router();

// router.get('/deliveries', requireAdminAuth, async (req, res, next) => {
//   try {
//     // Coerce and sanitize query params
//     const rawStatus = req.query.status;
//     const status = ALLOWED_STATUS.has(rawStatus) ? rawStatus : null;

//     const limit = Number.isFinite(Number(req.query.limit)) ? Math.max(1, parseInt(req.query.limit, 10)) : 50;
//     const offset = Number.isFinite(Number(req.query.offset)) ? Math.max(0, parseInt(req.query.offset, 10)) : 0;

//     const subscription_id = req.query.subscription_id || null;
//     const event_id = req.query.event_id || null;

//     const db = getDb();
//     const q = db('deliveries').orderBy('created_at', 'desc').limit(limit).offset(offset);

//     if (status) q.where({ status });
//     if (subscription_id) q.where({ subscription_id });
//     if (event_id) q.where({ event_id });

//     const data = await q;
//     res.json({ data, pagination: { limit, offset } });
//   } catch (e) {
//     next(e);
//   }
// });

// router.post('/deliveries/:id/retry', requireAdminAuth, async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const db = getDb();
//     const delivery = await db('deliveries').where({ id }).first();
//     if (!delivery) return res.status(404).json({ error: 'NotFound' });
//     await enqueueDelivery(id, 0);
//     res.status(202).json({ enqueued: true });
//   } catch (e) {
//     next(e);
//   }
// });

// router.get('/metrics', requireAdminAuth, (req, res) => {
//   res.json(metrics.snapshot());
// });

// module.exports = { router };


// backend/src/routes/admin.routes.js
const express = require('express');
const { requireAdminAuth } = require('../middlewares/auth');
const { getDb } = require('../config/db');
const { enqueueDelivery } = require('../queue/bullmq');
const metrics = require('../metrics/metrics');

const ALLOWED_STATUS = new Set(['PENDING', 'SUCCESS', 'FAILED', 'DISABLED']);
const router = express.Router();

router.get('/deliveries', requireAdminAuth, async (req, res, next) => {
  try {
    const rawStatus = req.query.status;
    const status = ALLOWED_STATUS.has(rawStatus) ? rawStatus : null;

    const limit = Number.isFinite(Number(req.query.limit)) ? Math.max(1, parseInt(req.query.limit, 10)) : 50;
    const offset = Number.isFinite(Number(req.query.offset)) ? Math.max(0, parseInt(req.query.offset, 10)) : 0;

    const subscription_id = req.query.subscription_id || null;
    const event_id = req.query.event_id || null;

    const db = getDb();
    const q = db('deliveries').orderBy('created_at', 'desc').limit(limit).offset(offset);
    if (status) q.where({ status });
    if (subscription_id) q.where({ subscription_id });
    if (event_id) q.where({ event_id });
    const data = await q;
    res.json({ data, pagination: { limit, offset } });
  } catch (e) {
    next(e);
  }
});

router.post('/deliveries/:id/retry', requireAdminAuth, async (req, res, next) => {
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
});

router.get('/metrics', requireAdminAuth, async (req, res, next) => {
  try {
    const snap = await metrics.snapshot();
    res.json(snap);
  } catch (e) {
    next(e);
  }
});

module.exports = { router };
