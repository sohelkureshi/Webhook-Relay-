/**
 * Tables:
 * - events: unique idempotency_key, payload, event type
 * - subscriptions: external endpoints and event_types[]
 * - deliveries: event-subscription linkage and status
 * - delivery_attempts: audit trail for each attempt
 */
exports.up = async function (knex) {
  await knex.schema.createTable('events', (t) => {
    t.string('id').primary();
    t.string('type').notNullable().index();
    t.string('source').notNullable();
    t.text('idempotency_key').notNullable().unique();
    t.jsonb('payload').notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('subscriptions', (t) => {
    t.string('id').primary();
    t.string('name').notNullable();
    t.text('callback_url').notNullable();
    t.specificType('event_types', 'text[]').notNullable();
    t.boolean('active').notNullable().defaultTo(true);
    t.text('secret').notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw('CREATE INDEX IF NOT EXISTS idx_subscriptions_event_types ON subscriptions USING GIN (event_types);');

  await knex.schema.createTable('deliveries', (t) => {
    t.string('id').primary();
    t.string('event_id').notNullable().references('events.id').onDelete('CASCADE');
    t.string('subscription_id').notNullable().references('subscriptions.id').onDelete('CASCADE');
    t.enu('status', ['PENDING', 'SUCCESS', 'FAILED', 'DISABLED'], { useNative: true, enumName: 'delivery_status' })
      .notNullable().defaultTo('PENDING').index();
    t.integer('attempt_count').notNullable().defaultTo(0);
    t.timestamp('next_attempt_at', { useTz: true }).nullable().index();
    t.timestamp('last_attempt_at', { useTz: true }).nullable();
    t.text('last_error').nullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.unique(['event_id', 'subscription_id']);
  });

  await knex.schema.createTable('delivery_attempts', (t) => {
    t.string('id').primary();
    t.string('delivery_id').notNullable().references('deliveries.id').onDelete('CASCADE').index();
    t.integer('status_code').nullable();
    t.integer('duration_ms').nullable();
    t.text('response_body').nullable();
    t.text('error').nullable();
    t.timestamp('attempted_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('delivery_attempts');
  await knex.schema.dropTableIfExists('deliveries');
  await knex.raw('DROP TYPE IF EXISTS delivery_status;');
  await knex.schema.dropTableIfExists('subscriptions');
  await knex.schema.dropTableIfExists('events');
};
