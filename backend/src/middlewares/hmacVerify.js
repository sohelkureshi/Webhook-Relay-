const crypto = require('crypto');
const { SIGNATURE_HEADER, TIMESTAMP_HEADER, HMAC_ALGO } = require('../config/security');
const { config } = require('../config/env');

function computeSignature(secret, bodyString, timestamp) {
  const h = crypto.createHmac(HMAC_ALGO, secret);
  h.update(`${timestamp}.${bodyString}`);
  return `v1=${h.digest('hex')}`;
}

function safeEqual(a, b) {
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

function hmacVerify(req, res, next) {
  const signature = req.get(SIGNATURE_HEADER);
  const timestamp = req.get(TIMESTAMP_HEADER);
  if (!signature || !timestamp) {
    return res.status(401).json({ error: 'SignatureMissing' });
  }
  const bodyString = JSON.stringify(req.body || {});
  const expected = computeSignature(config.hmacGlobalFallbackSecret, bodyString, timestamp);
  if (!safeEqual(expected, signature)) {
    return res.status(401).json({ error: 'SignatureInvalid' });
  }
  next();
}

module.exports = { hmacVerify, computeSignature };
