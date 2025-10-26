// const { getDb } = require('../config/db');
// const { signBody } = require('../utils/hmac');
// const { fetchWithTimeout } = require('../utils/httpClient');
// const { SIGNATURE_HEADER, EVENT_HEADER, DELIVERY_HEADER, TIMESTAMP_HEADER } = require('../config/security');
// const { DELIVERY_STATUS } = require('../utils/constants');

// async function attemptDelivery(deliveryId) {
//   const db = getDb();

//   const delivery = await db('deliveries').where({ id: deliveryId }).first();
//   if (!delivery) throw new Error('DeliveryNotFound');

//   const event = await db('events').where({ id: delivery.event_id }).first();
//   const sub = await db('subscriptions').where({ id: delivery.subscription_id }).first();

//   if (!sub.active) {
//     await db('deliveries').where({ id: deliveryId }).update({ status: DELIVERY_STATUS.DISABLED });
//     return { ok: false, disabled: true };
//   }

//   const timestamp = Math.floor(Date.now() / 1000).toString();
//   const bodyString = JSON.stringify({
//     id: delivery.id,
//     event_id: event.id,
//     type: event.type,
//     payload: event.payload,
//     created_at: event.created_at
//   });

//   const signature = signBody(sub.secret, bodyString, timestamp);

//   const headers = {
//     'content-type': 'application/json',
//     [SIGNATURE_HEADER]: signature,
//     [EVENT_HEADER]: event.type,
//     [DELIVERY_HEADER]: delivery.id,
//     [TIMESTAMP_HEADER]: timestamp
//   };

//   const started = Date.now();
//   let statusCode = null;
//   let responseBody = null;
//   let error = null;

//   try {
//     const res = await fetchWithTimeout(sub.callback_url, {
//       method: 'POST',
//       headers,
//       body: bodyString
//     });
//     statusCode = res.status;
//     responseBody = await res.text();

//     const ok = res.status >= 200 && res.status < 300;
//     await db('deliveries').where({ id: deliveryId }).update({
//       status: ok ? DELIVERY_STATUS.SUCCESS : DELIVERY_STATUS.FAILED,
//       attempt_count: delivery.attempt_count + 1,
//       last_attempt_at: db.fn.now(),
//       last_error: ok ? null : `HTTP_${res.status}`
//     });

//     await db('delivery_attempts').insert({
//       id: crypto.randomUUID(),
//       delivery_id: deliveryId,
//       status_code: res.status,
//       duration_ms: Date.now() - started,
//       response_body: responseBody
//     });

//     return { ok, statusCode, responseBody };
//   } catch (e) {
//     error = e.message || 'request_error';
//     await db('deliveries').where({ id: deliveryId }).update({
//       status: DELIVERY_STATUS.FAILED,
//       attempt_count: delivery.attempt_count + 1,
//       last_attempt_at: db.fn.now(),
//       last_error: error
//     });

//     await db('delivery_attempts').insert({
//       id: crypto.randomUUID(),
//       delivery_id: deliveryId,
//       status_code: null,
//       duration_ms: Date.now() - started,
//       error
//     });

//     return { ok: false, error };
//   }
// }

// module.exports = { attemptDelivery };


// backend/src/services/dispatch.service.js
const crypto = require('crypto');
const { getDb } = require('../config/db');
const { signBody } = require('../utils/hmac');
const { fetchWithTimeout } = require('../utils/httpClient');
const { SIGNATURE_HEADER, EVENT_HEADER, DELIVERY_HEADER, TIMESTAMP_HEADER } = require('../config/security');
const { DELIVERY_STATUS } = require('../utils/constants');
const metrics = require('../metrics/metrics');

async function attemptDelivery(deliveryId) {
  const db = getDb();

  const delivery = await db('deliveries').where({ id: deliveryId }).first();
  if (!delivery) throw new Error('DeliveryNotFound');

  const event = await db('events').where({ id: delivery.event_id }).first();
  const sub = await db('subscriptions').where({ id: delivery.subscription_id }).first();

  if (!sub.active) {
    await db('deliveries').where({ id: deliveryId }).update({ status: DELIVERY_STATUS.DISABLED });
    return { ok: false, disabled: true };
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyString = JSON.stringify({
    id: delivery.id,
    event_id: event.id,
    type: event.type,
    payload: event.payload,
    created_at: event.created_at
  });

  const signature = signBody(sub.secret, bodyString, timestamp);

  const headers = {
    'content-type': 'application/json',
    [SIGNATURE_HEADER]: signature,
    [EVENT_HEADER]: event.type,
    [DELIVERY_HEADER]: delivery.id,
    [TIMESTAMP_HEADER]: timestamp
  };

  const started = Date.now();

  try {
    const res = await fetchWithTimeout(sub.callback_url, {
      method: 'POST',
      headers,
      body: bodyString
    });
    const responseBody = await res.text();
    const ok = res.status >= 200 && res.status < 300;

    await db('deliveries').where({ id: deliveryId }).update({
      status: ok ? DELIVERY_STATUS.SUCCESS : DELIVERY_STATUS.FAILED,
      attempt_count: delivery.attempt_count + 1,
      last_attempt_at: db.fn.now(),
      last_error: ok ? null : `HTTP_${res.status}`
    });

    await db('delivery_attempts').insert({
      id: crypto.randomUUID(),
      delivery_id: deliveryId,
      status_code: res.status,
      duration_ms: Date.now() - started,
      response_body: responseBody
    });

    // Shared metrics increments (Redis)
    await metrics.inc(ok ? 'deliveries_success' : 'deliveries_failed', 1);

    return { ok, statusCode: res.status, responseBody };
  } catch (e) {
    await db('deliveries').where({ id: deliveryId }).update({
      status: DELIVERY_STATUS.FAILED,
      attempt_count: delivery.attempt_count + 1,
      last_attempt_at: db.fn.now(),
      last_error: e.message || 'request_error'
    });

    await db('delivery_attempts').insert({
      id: crypto.randomUUID(),
      delivery_id: deliveryId,
      status_code: null,
      duration_ms: Date.now() - started,
      error: e.message || 'request_error'
    });

    // Shared metrics increments (Redis)
    await metrics.inc('deliveries_failed', 1);

    return { ok: false, error: e.message || 'request_error' };
  }
}

module.exports = { attemptDelivery };
