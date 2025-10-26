const eventService = require('../services/event.service');

async function ingest(req, res, next) {
  try {
    const { type, source, payload, idempotency_key } = req.body;
    const result = await eventService.ingestEvent({ type, source, payload, idempotencyKey: idempotency_key });
    res.status(result.created ? 201 : 200).json({ event: result.event, created: result.created });
  } catch (err) {
    next(err);
  }
}

module.exports = { ingest };
