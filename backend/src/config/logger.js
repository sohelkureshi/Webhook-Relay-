const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: process.env.SERVICE_NAME || 'algohire-webhook-relay' },
  timestamp: pino.stdTimeFunctions.isoTime
});

module.exports = logger;
