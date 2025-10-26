const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const { router: eventsRouter } = require('./routes/events.routes');
const { router: webhooksRouter } = require('./routes/webhooks.routes');
const { router: adminRouter } = require('./routes/admin.routes');
const errorHandler = require('./middlewares/error');
const logger = require('./config/logger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: process.env.SERVICE_NAME || 'algohire-webhook-relay' });
});

app.use('/api/events', eventsRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/admin', adminRouter);

app.use(errorHandler);

// Unhandled rejection and exception logs
process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'UnhandledRejection');
});
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'UncaughtException');
});

module.exports = app;
