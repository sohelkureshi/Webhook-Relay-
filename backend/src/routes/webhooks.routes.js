const express = require('express');
const { requireAdminAuth } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const controller = require('../controllers/webhooks.controller');

const router = express.Router();

const createSchema = {
  type: 'object',
  required: ['name', 'callback_url', 'event_types', 'secret'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1 },
    callback_url: { type: 'string', minLength: 1 },
    event_types: { type: 'array', items: { type: 'string' }, minItems: 1 },
    secret: { type: 'string', minLength: 1 },
    active: { type: 'boolean' }
  }
};

const updateSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1 },
    callback_url: { type: 'string', minLength: 1 },
    event_types: { type: 'array', items: { type: 'string' } },
    secret: { type: 'string', minLength: 1 },
    active: { type: 'boolean' }
  }
};

router.get('/', requireAdminAuth, controller.list);
router.post('/', requireAdminAuth, validateBody(createSchema), controller.create);
router.patch('/:id', requireAdminAuth, validateBody(updateSchema), controller.update);
router.delete('/:id', requireAdminAuth, controller.remove);

module.exports = { router };
