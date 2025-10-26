const { config } = require('../config/env');

async function fetchWithTimeout(url, options = {}, timeoutMs = config.requestTimeoutMs) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

module.exports = { fetchWithTimeout };
