const logger = require('../config/logger');

module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  logger.error({ err }, 'Request failed');
  if (res.headersSent) return;
  res.status(err.status || 500).json({ error: err.name || 'Error', message: err.message || 'Internal Server Error' });
};
