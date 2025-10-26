// const counters = {
//   events_received: 0,
//   deliveries_total: 0,
//   deliveries_success: 0,
//   deliveries_failed: 0,
//   retries_scheduled: 0
// };

// function inc(key, by = 1) {
//   if (counters[key] == null) counters[key] = 0;
//   counters[key] += by;
// }

// function snapshot() {
//   return { ...counters, timestamp: new Date().toISOString() };
// }

// module.exports = { inc, snapshot };

// backend/src/metrics/metrics.js
// backend/src/metrics/metrics.js
const { redis } = require('../config/redis');

const KEYS = [
  'events_received',
  'deliveries_total',
  'deliveries_success',
  'deliveries_failed',
  'retries_scheduled'
];

function key(name) {
  return `metrics:${name}`;
}

async function inc(name, by = 1) {
  await redis.incrby(key(name), by);
}

async function get(name) {
  const v = await redis.get(key(name));
  return parseInt(v || '0', 10);
}

async function snapshot() {
  const vals = await Promise.all(KEYS.map((k) => get(k)));
  const out = {};
  KEYS.forEach((k, i) => { out[k] = vals[i]; });

  const now = new Date();
  // IST formatting
  const ist = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now);
  out.timestamp = ist; // show Indian time on the Metrics page

  return out;
}

module.exports = { inc, get, snapshot };
