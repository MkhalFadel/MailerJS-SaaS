# MailerJS

<p align="center">
  <img src="frontend/src/assets/mailerjsFullLogo.png" alt="MailerJS" width="300" />
</p>

MailerJS is a full-stack email campaign application for managing contacts, HTML templates, SMTP accounts, and manually started email campaigns. It pairs a React dashboard with an Express API, PostgreSQL/Prisma persistence, and a BullMQ worker backed by Redis so campaign requests do not keep the HTTP server open while recipients are processed.

> An **accepted** delivery means the configured SMTP server accepted the message. It does not prove that the message reached a recipient's inbox.

## Highlights

- Email/password authentication and Google Identity credential sign-in
- Secure, HTTP-only refresh-token cookies with automatic frontend access-token refresh
- Account profile editing, password setup/change, sign-out, and account deletion
- Per-user contacts with CSV import and plain-text email-list import
- Reusable HTML email templates with recipient personalization
- Encrypted SMTP account credentials and server-side SMTP connection testing
- Campaign subjects, template and SMTP selection, and recipient management
- Persistent BullMQ campaign-send queue, separate worker process, delivery history, progress polling, and safe retries
- Cancellation for queued or in-progress campaign sends
- Dashboard metrics and five most recently created campaigns
- Redis-backed, endpoint-specific API rate limiting with a safe in-memory fallback
- Responsive light/dark React interface using CSS Modules

## Technology

| Area | Implementation |
| --- | --- |
| Frontend | React 19, Vite, React Router, CSS Modules |
| API | Node.js, Express 5 |
| Database | PostgreSQL, Prisma 7, `@prisma/adapter-pg` |
| Queue | BullMQ and Redis (`ioredis`) |
| Email | Nodemailer |
| Authentication | JWT, HTTP-only cookies, bcrypt, Google Identity Services / Google Auth Library |
| Validation and security | express-validator, helmet, CORS, express-rate-limit, rate-limit-redis |

## Architecture

```mermaid
flowchart LR
   Browser[React / Vite frontend] -->|HTTP API + cookies| API[Express API]
   API -->|Prisma| DB[(PostgreSQL)]
   API -->|enqueue campaignSendId| Redis[(Redis)]
   Redis -->|BullMQ job| Worker[Campaign worker]
   Worker -->|Prisma state and delivery records| DB
   Worker -->|Nodemailer| SMTP[Configured SMTP provider]
```

The web API and campaign worker are deliberately separate processes. PostgreSQL is the source of truth for campaign sends and deliveries; Redis carries queue jobs and distributed rate-limit state.

## Repository layout

```text
MailerJS/
├── backend/
│   ├── controllers/          # HTTP request handlers
│   ├── middleware/           # Authentication, ownership, validation, rate limiters
│   ├── prisma/               # Prisma schema and migrations
│   ├── queues/               # BullMQ and Redis connection modules
│   ├── routes/               # Express route definitions
│   ├── services/             # Campaign, SMTP, template, and account services
│   ├── src/server.js         # API process entry point
│   ├── tests/                # Node test-runner tests
│   ├── utils/                # JWT, encryption, personalization, validation helpers
│   └── workers/              # Independently runnable campaign worker
├── frontend/
│   └── src/
│       ├── api/              # API clients and response mapping
│       ├── components/       # Feature components and shared UI
│       ├── contexts/         # Authentication and theme state
│       ├── pages/            # Routed views
│       └── assets/           # Application logo assets
└── README.md
```

## Features

### Authentication and account management

- Register and sign in with an email address and password.
- Sign in with a Google Identity credential. Google identity tokens are verified on the server before a MailerJS session is created.
- Access tokens are short lived; refresh tokens are stored in secure HTTP-only cookies. The frontend coordinates concurrent refresh attempts and retries a request once after a successful refresh.
- Google-only users can establish their first local password after Google reauthentication. Users who already have a password must provide their current password when changing it.
- Update profile information, sign out, or permanently delete the account from Account Settings.
- User-owned contacts, templates, SMTP accounts, and campaigns are deleted through the database's cascading ownership relationships when an account is deleted.

### Contacts

- Create, update, list, and delete contacts scoped to the authenticated user.
- Import up to 1,000 contacts at a time from a CSV file or a plain-text file.
  - CSV imports recognize `email` and optional `firstName`/`lastName` headers (case-insensitive header aliases are accepted by the importer).
  - Plain-text imports treat each valid email entry as a contact; first and last names may be empty.
  - Invalid rows and duplicate email addresses are skipped and import feedback reports the result.
- The frontend supports selecting a file or dropping it onto the import area.
- Deleting a contact used by campaigns requires confirmation. Associated campaign-recipient links are removed, while historical delivery snapshots remain understandable.

### Templates and personalization

- Store reusable HTML templates per user.
- Templates contain message content only; the email subject belongs to the campaign.
- Campaign subject and template HTML support these recipient placeholders:

  | Placeholder | Value |
  | --- | --- |
  | `{{first_name}}` | Recipient first name |
  | `{{last_name}}` | Recipient last name |
  | `{{email}}` | Recipient email address |

- A template referenced by an active queued or processing send cannot be deleted. For an inactive reference, deletion is confirmed and the campaign keeps its subject but has no template until one is chosen again.

### SMTP accounts

- Save one or more user-owned SMTP configurations with provider, host, port, TLS setting, username, sender name, and sender email.
- SMTP passwords are encrypted before persistence, decrypted only on the server for SMTP use, and excluded from API responses and queue payloads.
- Test an SMTP account connection before using it in a campaign.

### Campaigns and delivery history

- Create and edit campaigns with a name, required subject, template, SMTP account, and selected recipients.
- Add or remove recipients without changing the underlying contact records.
- View send history and recipient-level delivery history for each campaign.
- The dashboard reports real counts for contacts, templates, SMTP accounts, campaigns, accepted emails, failed delivery attempts, and the five most recently created campaigns.

### Durable queued sending

Starting a campaign creates a distinct `CampaignSend` run rather than changing a generic campaign status:

1. The API authenticates the caller, checks campaign ownership, and validates that the campaign has a template, SMTP account, and at least one recipient.
2. In a PostgreSQL transaction it creates the send run and persisted recipient/delivery snapshots.
3. It adds a minimal BullMQ job containing only `campaignSendId`, then returns `202 Accepted`.
4. The independent worker loads authoritative data from PostgreSQL, renders recipient-specific subject and HTML, and sends recipients sequentially through Nodemailer.
5. Each recipient result is persisted immediately, and the frontend polls the send run every 2.5 seconds while it remains active.

The API does not send every email during the request.

#### Send statuses

| Status | Meaning |
| --- | --- |
| `QUEUED` | The run was saved and is waiting for a worker. |
| `PROCESSING` | The worker is processing persisted recipients. |
| `CANCEL_REQUESTED` | Cancellation was requested for a run the worker may currently be handling. |
| `CANCELLED` | Processing stopped; accepted messages cannot be recalled. Unsent recipients remain not sent. |
| `COMPLETED` | Every recipient was accepted by SMTP. |
| `COMPLETED_WITH_ERRORS` | Processing finished, with one or more recipient failures. |
| `FAILED` | The send run could not be processed, such as a queue or infrastructure failure. |

An individual SMTP rejection is stored as a failed recipient result and does not abort the rest of the campaign.

#### Retry safety and duplicate-send protection

- A delivery record uniquely represents a send run and recipient. The worker skips recipients already marked accepted, so a BullMQ retry does not resend messages that were accepted before a worker crash or retry.
- Jobs use up to three attempts with exponential backoff for infrastructure-level failures. Recipient-level failures are recorded and processing continues rather than retrying the whole run.
- A nullable unique active key on each send run allows only one active run per campaign. A second send request while a run is queued, processing, or awaiting cancellation receives `409 Conflict`. Terminal runs clear the key, so the campaign can be sent again later without overwriting history.
- On worker startup and at a periodic recovery check, persisted queued send runs can be re-enqueued.
- If PostgreSQL records a run but Redis enqueueing fails, the run is marked failed, its active lock is cleared, and the request reports a service failure instead of claiming that sending was queued.

#### Cancellation

- A queued send is removed from the queue and finalized as cancelled when possible.
- An in-progress send transitions to `CANCEL_REQUESTED`; the worker checks that state before starting additional recipients and finalizes it as `CANCELLED`.
- The SMTP operation already in flight may finish. Cancellation does not recall messages already accepted by SMTP.

## Requirements

- Node.js and npm
- PostgreSQL database
- Redis instance reachable by both the API and worker
- A Google OAuth web client only if Google sign-in is enabled
- SMTP account details to send email

No Node.js version is declared by this repository. Use a current Node.js release supported by the installed dependencies.

## Local setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/MkhalFadel/MailerJS-SaaS.git
cd MailerJS

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment files

Copy each example file before supplying local values:

```bash
cd backend
cp .env.example .env

cd ../frontend
cp .env.example .env
```

#### Backend environment (`backend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API port; the example uses `5000`. |
| `DATABASE_URL` | Yes | PostgreSQL connection URL used by Prisma. |
| `JWT_SECRET` | Yes | Secret for access tokens. |
| `REFRESH_SECRET` | Yes | Secret for refresh tokens. |
| `GOOGLE_CLIENT_ID` | For Google sign-in | Google OAuth web-client ID used to verify Google ID tokens. |
| `FRONTEND_URL` | Yes | Allowed frontend origin for CORS; local example: `http://localhost:5173`. |
| `AUTH_COOKIE_SAME_SITE` | No | Refresh-cookie SameSite policy; default/example is `lax`. |
| `SMTP_ENCRYPTION_KEY` | Yes for SMTP passwords | Key used to encrypt stored SMTP passwords. |
| `QUEUE_REDIS_URL` | Yes for queued sending | Redis URL shared by the campaign queue, worker, and distributed rate-limit store. |
| `RATE_LIMIT_ENABLED` | No | Set `false` only to disable application rate limiters intentionally; default/example is `true`. |
| `RATE_LIMIT_GENERAL_LIMIT` | No | Requests allowed by the general API limiter per window; default/example is `600`. |
| `RATE_LIMIT_GENERAL_WINDOW_MS` | No | General API limiter window in milliseconds; default/example is `900000` (15 minutes). |
| `TRUST_PROXY_HOPS` | No | Numeric trusted-proxy hop count for deployments behind a reverse proxy. Leave unset unless the proxy topology is known. |

Example `DATABASE_URL` shape (use your own credentials):

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/mailerjs?schema=public
```

#### Frontend environment (`frontend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Base API URL; local example: `http://localhost:5000/api`. |
| `VITE_GOOGLE_CLIENT_ID` | For Google sign-in | Same Google OAuth web-client ID used by the backend. |

Do not commit `.env` files, JWT secrets, database passwords, SMTP passwords, Redis credentials, or Google credentials.

### 3. Apply database migrations

From `backend/`:

```bash
npx prisma migrate deploy
npx prisma generate
```

For local schema development, use `npx prisma migrate dev --name <migration-name>` instead of resetting an existing database. Prisma migrations preserve existing application records; do not run a database reset for normal setup or deployment.

### 4. Start Redis

The API may continue serving normal routes if Redis is unavailable, but campaign sends cannot be enqueued until Redis is reachable. Production deployments should use a managed Redis service or a separately managed Redis process.

For a local Ubuntu/Debian installation:

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable --now redis-server
redis-cli ping
```

For a local Docker-based Redis instance:

```bash
docker run --name mailerjs-redis -p 6379:6379 redis:7-alpine
```

Then point `QUEUE_REDIS_URL` to that instance, for example `redis://127.0.0.1:6379`.

### 5. Run the three local processes

Open separate terminals:

```bash
# Terminal 1: API
cd backend
npm start
```

```bash
# Terminal 2: campaign worker
cd backend
npm run worker
```

```bash
# Terminal 3: frontend
cd frontend
npm run dev
```

The API starts from `backend/src/server.js`, and the worker starts from `backend/workers/campaignWorker.js`. Deploy them as separate services using the same PostgreSQL database and `QUEUE_REDIS_URL`.

### Google sign-in configuration

1. Create a Google OAuth **web application** client in Google Cloud.
2. Add each frontend origin that will load the Google sign-in button to the client's authorized JavaScript origins (for local development, typically `http://localhost:5173`).
3. Set the same client ID in `backend/.env` as `GOOGLE_CLIENT_ID` and in `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`.
4. Restart the API and Vite processes after changing environment values.

MailerJS receives a Google Identity credential in the browser, verifies it using `google-auth-library` on the API, then creates its own session. This implementation does not use a frontend callback route or require a Google client secret in the application environment.

## API overview

All protected endpoints require the existing authentication middleware and enforce ownership of user-scoped records.

| Base path | Main endpoints | Purpose |
| --- | --- | --- |
| `/api/users` | `POST /register`, `POST /login`, `POST /google`, `POST /refresh`, `POST /logout` | Registration, local sign-in, Google sign-in, token refresh, and sign-out. |
| `/api/users` | `GET /`, `PUT /update`, `PATCH /password`, `POST /google/reauthenticate`, `DELETE /delete` | Current-user profile and sensitive account actions. |
| `/api/contacts` | `GET /`, `POST /`, `POST /import`, `PUT /:id`, `DELETE /:id` | Contact CRUD and CSV/plain-text import. |
| `/api/templates` | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` | Template CRUD. |
| `/api/smtp` | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`, `POST /:id/test` | SMTP account CRUD and connection testing. |
| `/api/campaigns` | `GET /`, `POST /`, `GET/PUT/DELETE /:id` | Campaign CRUD. |
| `/api/campaigns` | `GET/POST /:campaignId/recipients`, `DELETE /:campaignId/recipients/:contactId` | Campaign recipient management. |
| `/api/campaigns` | `POST /:id/send`, `GET /:id/sends`, `GET /:id/sends/:sendId` | Queue a send and retrieve send progress/history. |
| `/api/campaigns` | `POST /:id/sends/:sendId/cancel`, `GET /:id/deliveries` | Cancel a send and view recipient delivery history. |
| `/api/dashboard` | `GET /` | Authenticated dashboard metrics and recent campaigns. |

The frontend API layer maps API response fields for React components, sends cookies with API requests, and does not connect directly to Redis.

## Data model notes

Prisma models and migrations live in `backend/prisma/`.

- A `User` owns contacts, templates, SMTP accounts, and campaigns.
- A `Campaign` has a required subject, a nullable template reference, an SMTP account, campaign recipients, and historical `CampaignSend` runs.
- `CampaignSend` holds run-specific status, persisted totals, accepted/failed counts, timestamps, an optional safe error message, and the unique nullable active key used to prevent concurrent sends.
- `CampaignDelivery` links a recipient outcome to a send run when applicable. It preserves recipient email/name snapshots and is nullable where necessary to remain compatible with historical delivery records.
- Existing delivery history is not replaced when a campaign is sent again; each resend creates a new send run and delivery set.

## Rate limiting

Rate limiting applies only to `/api` routes. It uses the shared Redis URL when available, and safely falls back to a per-process memory store if Redis is unavailable so a Redis outage does not take down normal API requests. Redis connection errors are handled without leaking credentials.

| Scope | Default policy | Key |
| --- | --- | --- |
| General API traffic | 600 requests / 15 minutes | Client IP |
| Failed local login | 10 failed attempts / 15 minutes | Client IP; successful requests do not count |
| Registration | 5 requests / hour | Client IP |
| Google sign-in | 15 requests / 15 minutes | Client IP |
| Refresh token | 60 requests / 15 minutes | Client IP |
| Google reauthentication | 10 requests / 15 minutes | Authenticated user |
| Password change and account deletion | 5 requests / 15 minutes | Authenticated user |
| SMTP connection test | 15 requests / 10 minutes | Authenticated user |
| Campaign send | 20 requests / hour | Authenticated user |
| Campaign cancellation | 30 requests / 15 minutes | Authenticated user |

The limiters use standard rate-limit headers, skip `OPTIONS` requests, return a structured `429` response, and fail open if their backing store has an infrastructure issue. Configure `TRUST_PROXY_HOPS` only for the known number of trusted reverse-proxy hops so client-IP limits remain meaningful.

## Testing and quality checks

Run backend tests from `backend/`:

```bash
npm test
```

Validate the Prisma schema from `backend/`:

```bash
npx prisma validate
```

Lint and build the frontend from `frontend/`:

```bash
npm run lint
npm run build
```

The backend test command uses Node's built-in test runner. The frontend currently exposes lint and production-build scripts; it does not define a separate frontend test script.

## Deployment notes

Run at least these services in production:

1. **Frontend** — build and serve the Vite application with its production `VITE_API_URL` and, if enabled, `VITE_GOOGLE_CLIENT_ID` set at build time.
2. **API** — run `npm start` in `backend/`; provide PostgreSQL, Redis, JWT/refresh secrets, CORS origin, cookie policy, and SMTP encryption key.
3. **Campaign worker** — run `npm run worker` in `backend/`; provide the same PostgreSQL, Redis, and SMTP encryption configuration as the API.
4. **PostgreSQL and Redis** — use durable managed services or independently supervised processes appropriate for the deployment.

Run `npx prisma migrate deploy` as part of the backend deployment process before serving traffic that relies on a new schema. Ensure `FRONTEND_URL`, `AUTH_COOKIE_SAME_SITE`, TLS, and `TRUST_PROXY_HOPS` match the real production topology. The API and worker close Prisma and Redis/BullMQ resources during graceful shutdown.

## Security notes

- Password hashes use bcrypt; passwords are never returned in API responses.
- SMTP passwords are encrypted at rest and never placed in BullMQ payloads or returned to the frontend.
- Queue jobs contain a campaign-send identifier, not recipient lists, campaign HTML, or SMTP credentials.
- Authorization checks protect contacts, templates, SMTP accounts, campaigns, send runs, deliveries, cancellation, and account actions from cross-user access.
- CSRF/XSS and broader deployment security still depend on correctly configuring HTTPS, CORS, cookie settings, reverse proxies, database access, and Redis access for the hosting environment.

## Current scope and limitations

- Campaigns are started manually; scheduled sends and cron-based campaign scheduling are not implemented.
- Recipient processing is deliberately sequential. Provider-aware throughput controls and advanced rate scheduling are not implemented yet.
- MailerJS tracks SMTP acceptance and failure, not opens, clicks, bounces, unsubscribe events, or final inbox placement.
- Cancellation stops future recipient attempts when the worker observes it; it cannot recall a message already accepted by an SMTP provider.
- A server-backed password-reset email workflow is not currently exposed by the API.

## Contributing

Keep changes focused, preserve the API's ownership and authentication checks, and validate the relevant backend and frontend commands before submitting a change. Do not commit local environment files or credentials.
