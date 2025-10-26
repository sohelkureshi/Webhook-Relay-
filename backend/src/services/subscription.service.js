const crypto = require('crypto');
const { getDb } = require('../config/db');
const { redis } = require('../config/redis');

function newId() {
  return crypto.randomUUID();
}

function cacheKeyForType(eventType) {
  return `subs:${eventType}`;
}

async function invalidateCacheForTypes(eventTypes) {
  const keys = eventTypes.map(cacheKeyForType);
  if (keys.length) {
    await redis.del(keys);
  }
}

async function getActiveByEventType(eventType) {
  const key = cacheKeyForType(eventType);
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const db = getDb();
  // subscriptions where event_types @> [eventType] and active = true
  const rows = await db('subscriptions')
    .where('active', true)
    .whereRaw('? = ANY (event_types)', [eventType]);

  await redis.set(key, JSON.stringify(rows), 'EX', 60);
  return rows;
}

async function list() {
  const db = getDb();
  return db('subscriptions').orderBy('created_at', 'desc');
}

async function create({ name, callback_url, event_types, secret, active = true }) {
  const db = getDb();
  const id = newId();
  const row = {
    id,
    name,
    callback_url,
    event_types,
    active,
    secret
  };
  const [created] = await db('subscriptions').insert(row).returning('*');
  await invalidateCacheForTypes(event_types || []);
  return created;
}

async function update(id, patch) {
  const db = getDb();
  const before = await db('subscriptions').where({ id }).first();
  if (!before) return null;

  const updatedFields = {
    ...patch,
    updated_at: db.fn.now()
  };

  const [after] = await db('subscriptions').where({ id }).update(updatedFields).returning('*');

  const affectedTypes = new Set();
  (before.event_types || []).forEach((t) => affectedTypes.add(t));
  (after.event_types || []).forEach((t) => affectedTypes.add(t));
  await invalidateCacheForTypes(Array.from(affectedTypes));
  return after;
}

async function remove(id) {
  const db = getDb();
  const sub = await db('subscriptions').where({ id }).first();
  if (!sub) return 0;
  await invalidateCacheForTypes(sub.event_types || []);
  return db('subscriptions').where({ id }).del();
}

module.exports = {
  list,
  create,
  update,
  remove,
  getActiveByEventType
};
