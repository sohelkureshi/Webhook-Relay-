const subs = require('../services/subscription.service');

async function list(req, res, next) {
  try {
    const data = await subs.list();
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const created = await subs.create(req.body);
    res.status(201).json({ data: created });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const updated = await subs.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'NotFound' });
    res.json({ data: updated });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const count = await subs.remove(req.params.id);
    if (!count) return res.status(404).json({ error: 'NotFound' });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, update, remove };
