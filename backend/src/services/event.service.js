// const crypto = require('crypto');
// const { getDb } = require('../config/db');
// const subscriptionService = require('./subscription.service');
// const { enqueueDelivery } = require('../queue/bullmq');
// const { DELIVERY_STATUS } = require('../utils/constants');
// const metrics = require('../metrics/metrics');

// function newId() {
//   return crypto.randomUUID();
// }

// async function ingestEvent({ type, source, payload, idempotencyKey }) {
//   const db = getDb();
//   metrics.inc('events_received', 1);

//   // Try insert; on conflict, fetch existing (idempotency)
//   let eventRow;
//   let created = false;
//   try {
//     eventRow = await db('events')
//       .insert({
//         id: newId(),
//         type,
//         source,
//         payload,
//         idempotency_key: idempotencyKey
//       })
//       .returning('*')
//       .then((rows) => rows[0]);
//     created = true;
//   } catch (e) {
//     // Unique violation on idempotency_key; fetch existing
//     eventRow = await db('events').where({ idempotency_key: idempotencyKey }).first();
//   }

//   // Resolve active subscriptions for the event type (cache-backed)
//   const subs = await subscriptionService.getActiveByEventType(type);

//   // Create deliveries for each subscription
//   for (const sub of subs) {
//     const deliveryId = newId();
//     await db('deliveries').insert({
//       id: deliveryId,
//       event_id: eventRow.id,
//       subscription_id: sub.id,
//       status: sub.active ? DELIVERY_STATUS.PENDING : DELIVERY_STATUS.DISABLED
//     });
//     if (sub.active) {
//       await enqueueDelivery(deliveryId, 0);
//       metrics.inc('deliveries_total', 1);
//     }
//   }

//   return { event: eventRow, created };
// }

// module.exports = { ingestEvent };


// backend/src/services/event.service.js
const crypto = require('crypto');
const { getDb } = require('../config/db');
const subscriptionService = require('./subscription.service');
const { enqueueDelivery } = require('../queue/bullmq');
const { DELIVERY_STATUS } = require('../utils/constants');
const metrics = require('../metrics/metrics');

function newId() {
  return crypto.randomUUID();
}

async function ingestEvent({ type, source, payload, idempotencyKey }) {
  const db = getDb();
  await metrics.inc('events_received', 1);

  let eventRow;
  let created = false;
  try {
    eventRow = await db('events')
      .insert({
        id: newId(),
        type,
        source,
        payload,
        idempotency_key: idempotencyKey
      })
      .returning('*')
      .then((rows) => rows[0]);
    created = true;
  } catch (e) {
    eventRow = await db('events').where({ idempotency_key: idempotencyKey }).first();
  }

  const subs = await subscriptionService.getActiveByEventType(type);

  for (const sub of subs) {
    const deliveryId = newId();
    await db('deliveries').insert({
      id: deliveryId,
      event_id: eventRow.id,
      subscription_id: sub.id,
      status: sub.active ? DELIVERY_STATUS.PENDING : DELIVERY_STATUS.DISABLED
    });
    if (sub.active) {
      await enqueueDelivery(deliveryId, 0);
      await metrics.inc('deliveries_total', 1);
    }
  }

  return { event: eventRow, created };
}

module.exports = { ingestEvent };
