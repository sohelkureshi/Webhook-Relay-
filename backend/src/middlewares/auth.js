const { config } = require('../config/env');

function requireInternalAuth(req, res, next) {
  const key = req.header('x-api-key');
  if (key !== config.internalApiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function requireAdminAuth(req, res, next) {
  const key = req.header('x-api-key');
  if (key !== config.adminApiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

module.exports = { requireInternalAuth, requireAdminAuth };
