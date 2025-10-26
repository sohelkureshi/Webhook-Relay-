const crypto = require('crypto');
const { HMAC_ALGO } = require('../config/security');

function signBody(secret, bodyString, timestamp) {
  const payload = `${timestamp}.${bodyString}`;
  const h = crypto.createHmac(HMAC_ALGO, secret);
  h.update(payload);
  const digest = h.digest('hex');
  return `v1=${digest}`;
}

module.exports = { signBody };
