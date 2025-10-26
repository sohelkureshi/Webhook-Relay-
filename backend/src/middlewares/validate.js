const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true, removeAdditional: true });

function validateBody(schema) {
  const validate = ajv.compile(schema);
  return (req, res, next) => {
    const ok = validate(req.body);
    if (!ok) {
      return res.status(400).json({ error: 'ValidationError', details: validate.errors });
    }
    next();
  };
}

module.exports = { validateBody };
