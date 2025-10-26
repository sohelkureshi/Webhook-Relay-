const { redis } = require('../config/redis');

async function getJSON(key) {
  const raw = await redis.get(key);
  return raw ? JSON.parse(raw) : null;
}

async function setJSON(key, value, ttlSec) {
  const data = JSON.stringify(value);
  if (ttlSec) {
    await redis.set(key, data, 'EX', ttlSec);
  } else {
    await redis.set(key, data);
  }
}

module.exports = { getJSON, setJSON };
