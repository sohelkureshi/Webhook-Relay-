const express = require('express');
const { validateBody } = require('../middlewares/validate');
const { requireInternalAuth } = require('../middlewares/auth');
const controller = require('../controllers/events.controller');

const router = express.Router();

const eventSchema = {
  type: 'object',
  required: ['type', 'source', 'payload', 'idempotency_key'],
  additionalProperties: false,
  properties: {
    type: { type: 'string', minLength: 1 },
    source: { type: 'string', minLength: 1 },
    idempotency_key: { type: 'string', minLength: 1 },
    payload: { type: 'object' }
  }
};

router.post('/', requireInternalAuth, validateBody(eventSchema), controller.ingest);

module.exports = { router };
