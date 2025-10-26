const { getDb } = require('../config/db');

async function findEventByIdempotency(key) {
  const db = getDb();
  return db('events').where({ idempotency_key: key }).first();
}

module.exports = { findEventByIdempotency };
