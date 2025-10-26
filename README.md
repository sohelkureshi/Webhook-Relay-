# AlgoHire Webhook Relay

Build a secure webhook relay with a backend API, background worker, PostgreSQL, Redis, and a React admin dashboard.

## What it does
- Accepts internal events with idempotency.
- Fans out signed webhooks to subscribed endpoints.
- Retries failed deliveries with backoff.
- Shows webhooks, deliveries, failures, and metrics in a dashboard.

## Stack
- Backend: Node.js, Express, Knex, PostgreSQL.
- Queue and cache: Redis, BullMQ worker.
- Frontend: React, minimal CSS.
- Security: API keys and HMAC signatures.

## Prerequisites
- Node.js 18 or newer.
- PostgreSQL running locally.
- Redis running locally.

## Backend setup
- Go to backend folder.
- Copy .env.example to .env and set values.
- Set DATABASE_URL and REDIS_URL to your local services.
- Install dependencies.
- Run database migrations.
- Start API and Worker in separate terminals.

Commands:
```
cd backend
npm install
cp .env.example .env
npm run migrate
npm start or node src/server.js        # API on port 8080
```
In new terminal
```
npm run worker    # Queue consumer
```

## Frontend setup
- Go to frontend folder.
- Copy .env.example to .env and set VITE_API_BASE_URL.
- Install dependencies.
- Start the dev server.

Commands:
```
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Login
- Open the app and go to the login page.
- Enter the admin API key from backend .env.
- After login, the sidebar becomes visible.

## Dashboard pages
- Webhooks: Create, edit, delete subscriptions for event types.
- Deliveries: View status, attempts, and retry a delivery.
- Failed: Focus on failed deliveries for quick retries.
- Metrics: See events, total deliveries, successes, failures, retries.

## Quick test
- Create a webhook with a callback URL, event types, secret, and active flag.
- Send an internal event with type, source, idempotency_key, and payload.
- Check Deliveries for PENDING, SUCCESS, or FAILED rows.
- Use Retry on non-successful rows when needed.

Example commands:
```
# Create webhook (admin)
curl -X POST http://localhost:8080/api/webhooks \
  -H "x-api-key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Receiver",
    "callback_url": "https://httpbin.org/post",
    "event_types": ["test.event"],
    "secret": "test-secret",
    "active": true
  }'

# Ingest event (internal)
curl -X POST http://localhost:8080/api/events \
  -H "x-api-key: YOUR_INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test.event",
    "source": "local.dev",
    "idempotency_key": "idem-1001",
    "payload": { "example": true }
  }'
```

## Metrics behavior
- events_received increases per unique event accepted.
- deliveries_total increases per active subscription per event.
- deliveries_success increases on 2xx responses from subscribers.
- deliveries_failed increases on non-2xx or network errors.
- retries_scheduled increases when the worker enqueues a retry.
- Timestamp is shown in Indian Standard Time.

## Notes
- Outbound webhooks include HMAC signature headers for verification.
- Admin endpoints require the admin API key.
- Event ingestion requires the internal API key.
- Redis-backed metrics allow API and worker to share counters.



