const knex = require('knex');
const { config } = require('./env');
const logger = require('./logger');

let db;

function getDb() {
  if (!db) {
    db = knex({
      client: 'pg',
      connection: config.databaseUrl,
      pool: { min: 2, max: 10 }
    });
  }
  return db;
}

async function initDb() {
  const k = getDb();
  await k.raw('select 1');
  logger.info('Database connection verified');
}

module.exports = { getDb, initDb };
