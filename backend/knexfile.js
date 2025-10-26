require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/db/migrations',
      tableName: 'knex_migrations'
    },
    pool: { min: 2, max: 10 }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/db/migrations',
      tableName: 'knex_migrations'
    },
    pool: { min: 2, max: 10 }
  }
};
