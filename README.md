# MailerJS

MailerJS is a full-stack email-campaign application for managing contacts, email templates, SMTP accounts, and recipient-based campaigns. It has a React single-page application, an Express API backed by PostgreSQL/Prisma, and a separate BullMQ worker for durable campaign sending.

Campaign emails are never sent as part of the HTTP request. The API validates and records a send run, Redis queues the work, and a dedicated worker sends recipients while persisting progress and delivery history in PostgreSQL.

<!-- Add an application screenshot here when one is available. -->

## Features

### Campaigns and delivery

- Create, edit, and delete campaigns that use a saved template and SMTP account.
- Add existing contacts as campaign recipients.
- Queue a campaign send and receive an immediate `202 Accepted` response.
- Track persistent send runs with queued, processing, complete, partial-error, and failed states.
- Poll live send progress from the campaign details page, including after a page reload.
- Keep delivery history for each send run, including accepted/failed status, send time, and safe error messages.
- Safely send the same campaign again after its earlier send run reaches a terminal state.

### Contact, template, and SMTP management

- Create, update, list, and delete contacts scoped to the signed-in user.
- Create, update, list, and delete reusable email templates.
- Personalize campaign subjects and bodies with `{{first_name}}`, `{{last_name}}`, and `{{email}}`.
- Store SMTP configuration per user, choose a default account, and test an SMTP connection.
- Encrypt SMTP passwords at rest with `SMTP_ENCRYPTION_KEY`; passwords are not returned to the frontend.

### Authentication and account security

- Cookie-based JWT authentication with short-lived access tokens and refresh tokens.
- Automatic access-token refresh in the frontend, with a single shared refresh request when several requests receive an expired-token response at once.
- Email/password registration and sign-in.
- Google Identity Services sign-in, verified server-side with Google token verification.
- Account profile updates, password changes, logout, and account deletion.
- Google-only accounts can set their first password after a fresh Google reauthentication; accounts that use passwords must provide their current password to change it.

### Product experience

- User-scoped dashboard metrics for contacts, campaigns, templates, SMTP accounts, and accepted/failed email counts.
- Protected React routes and a persisted light/dark theme preference.
- Responsive React UI built with CSS Modules and shared CSS custom properties.

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, React Router, Vite, CSS Modules |
| API | Node.js, Express, CommonJS |
| Database | PostgreSQL, Prisma, `pg` |
| Background processing | BullMQ and Redis (`ioredis`) |
| Email | Nodemailer |
| Authentication | JWT, HTTP-only cookies, `bcryptjs`, Google Identity Services / `google-auth-library` |

## Architecture

```text
React + Vite frontend
        |
        | cookie-authenticated HTTP requests
        v
Express API ----------------------> PostgreSQL / Prisma
        |                                 |
        | create CampaignSend +            | source of truth for campaigns,
        | recipient snapshot                | send progress, and deliveries
        v                                 |
Redis / BullMQ <------------------------+
        |
        | minimal job payload: campaignSendId
        v
Separate campaign worker
        |
        | loads configuration and recipients from PostgreSQL
        v
SMTP provider via Nodemailer
```

The API and worker are independent processes. They share the same PostgreSQL database and Redis instance; the frontend never connects to Redis.

## Project structure

```text
MailerJS/
├── backend/
│   ├── prisma/                 # Prisma schema and migrations
│   ├── queues/                 # Central Redis and BullMQ queue helpers
│   ├── src/
│   │   ├── controllers/        # HTTP handlers
│   │   ├── middleware/         # Authentication and ownership checks
│   │   ├── routes/             # Express routes
│   │   ├── services/           # Campaign, SMTP, dashboard, and auth services
│   │   └── utils/              # Encryption and template rendering helpers
│   ├── tests/                  # Node test runner tests
│   └── workers/                # Separate BullMQ campaign worker
└── frontend/
    └── src/
        ├── api/                # Backend API client and response mapping
        ├── components/         # Feature and shared UI components
        ├── context/            # Authentication and theme state
        ├── layouts/            # Application layout
        ├── pages/              # Routed pages
        └── styles/             # Global variables and base styles
```

## Prerequisites

- Node.js and npm
- PostgreSQL
- Redis
- An SMTP account/provider for sending email
- A Google OAuth client ID only if Google sign-in is enabled

## Local setup

Clone the repository and install dependencies for each application:

```bash
git clone https://github.com/MkhalFadel/MailerJS-SaaS.git
cd MailerJS

cd backend
npm install
cp .env.example .env

cd ../frontend
npm install
cp .env.example .env
```

Edit the two `.env` files with local, non-production values. Do not commit them.

### Backend environment variables

`backend/.env.example` is the authoritative list of backend configuration keys.

| Variable | Required | Purpose / safe local example |
| --- | --- | --- |
| `PORT` | Yes | API port, for example `5000`. |
| `DATABASE_URL` | Yes | PostgreSQL URL, for example `postgresql://USER:PASSWORD@localhost:5432/mailerjs?schema=public`. |
| `JWT_SECRET` | Yes | Secret used to sign access tokens. Use a long random value. |
| `REFRESH_SECRET` | Yes | Separate long random secret for refresh tokens. |
| `GOOGLE_CLIENT_ID` | Only for Google sign-in | Google OAuth web client ID used to verify Google credentials on the server. |
| `FRONTEND_URL` | Yes | Allowed frontend origin, for example `http://localhost:5173`. |
| `AUTH_COOKIE_SAME_SITE` | Yes | Cookie SameSite setting; the example uses `lax`. |
| `SMTP_ENCRYPTION_KEY` | Yes for SMTP accounts | Long random secret used to encrypt stored SMTP passwords. Changing it makes previously stored SMTP passwords unreadable. |
| `QUEUE_REDIS_URL` | Yes for campaign sending | Redis connection URL, for example `redis://localhost:6379`. |

For a deployed API, set the standard `NODE_ENV=production` runtime setting so authentication cookies use their production secure-cookie behavior.

### Frontend environment variables

| Variable | Required | Purpose / safe local example |
| --- | --- | --- |
| `VITE_API_URL` | Yes | API base URL, for example `http://localhost:5000/api`. |
| `VITE_GOOGLE_CLIENT_ID` | Only for Google sign-in | Google OAuth web client ID supplied to Google Identity Services in the browser. It must match the server configuration. |

Vite exposes `VITE_*` values to browser code. Never place server secrets, SMTP credentials, or database URLs in the frontend environment file.

### PostgreSQL and Prisma

Create a PostgreSQL database, set `DATABASE_URL`, then generate the Prisma client and apply the committed migrations:

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

`prisma migrate deploy` applies the repository migrations without resetting existing application data. For a new development migration, use Prisma's normal migration workflow, review the generated migration, and commit it with the schema change.

### Redis

Run a Redis instance reachable at `QUEUE_REDIS_URL`. Redis is required only for enqueuing and consuming campaign send jobs; PostgreSQL remains the persistent record of send runs and delivery results.

For a default local Redis installation, the example URL is:

```text
redis://localhost:6379
```

## Running the application

Run all three processes in separate terminals after PostgreSQL and Redis are available.

```bash
# Terminal 1: API (http://localhost:5000 by default)
cd backend
npm start
```

```bash
# Terminal 2: campaign worker
cd backend
npm run worker
```

```bash
# Terminal 3: Vite frontend (http://localhost:5173 by default)
cd frontend
npm run dev
```

The worker is deliberately not started by the Express server. In deployment, run the API and `npm run worker` as separate services with access to the same PostgreSQL database and Redis instance.

## Authentication and Google sign-in

The application uses HTTP-only authentication cookies. The browser API client sends requests with credentials and retries an expired access-token request once after a refresh-token request succeeds. If refresh fails, the frontend clears its authenticated user state.

To enable Google sign-in:

1. Create a Google OAuth web client in Google Cloud.
2. Configure its authorized JavaScript origins for the frontend origin, such as `http://localhost:5173` locally.
3. Put its client ID in both `backend/.env` as `GOOGLE_CLIENT_ID` and `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`.
4. Restart the API and Vite development server after changing environment files.

Google ID tokens are verified on the server. MailerJS does not silently link a Google identity to an existing password account with the same email; use the intended account sign-in method instead. A Google-only user who wants to establish their first password must complete fresh Google reauthentication first.

## Campaign queue and sending behavior

### Send lifecycle

When `POST /api/campaigns/:campaignId/send` succeeds, it:

1. Authenticates the user and checks campaign ownership.
2. Validates the campaign's template, SMTP account, and recipients.
3. Creates a persistent `CampaignSend` record and recipient/delivery snapshot in PostgreSQL.
4. Enqueues a BullMQ job containing only `campaignSendId`.
5. Returns `202 Accepted` with send-run information.

The job uses up to three attempts with exponential backoff for infrastructure-level failures. Ordinary recipient-specific SMTP errors are recorded as failed deliveries and do not abort the remaining recipients.

The worker processes recipients sequentially. It loads the current send configuration and encrypted SMTP password server-side, decrypts only for the Nodemailer transporter, and writes each recipient result immediately.

### Send statuses

| Status | Meaning |
| --- | --- |
| `QUEUED` | The send run is persisted and waiting for worker processing. |
| `PROCESSING` | The worker is sending the persisted recipient snapshot. |
| `COMPLETED` | All recipients were accepted by the SMTP server. |
| `COMPLETED_WITH_ERRORS` | Processing finished, but one or more recipients failed. |
| `FAILED` | The whole run could not be processed, such as queue/configuration/infrastructure failure. |

“Accepted” means that the SMTP server accepted the message. It does not guarantee final inbox delivery.

### Retry safety and duplicate-send protection

Each delivery record is uniquely tied to a send run and campaign recipient. If a worker crashes or BullMQ retries a job, already accepted recipients are read from PostgreSQL and skipped; the worker does not resend them.

Only one `QUEUED` or `PROCESSING` run is allowed per campaign. A database-backed active key protects this rule across concurrent requests. A second request while a send is active receives `409 Conflict`. Once a run is terminal, the active key is cleared so a later send creates a new historical run.

If PostgreSQL records a send successfully but Redis cannot enqueue it, the send run is marked failed, the active lock is cleared, and the API reports a service error rather than pretending the send was queued.

### Frontend progress tracking

The campaign details page fetches the campaign's send history on load, prefers an active run when one exists, and polls that run approximately every 2.5 seconds while it is queued or processing. It stops polling at a terminal status and refreshes delivery history. The Send button is disabled while the current campaign has an active send.

## SMTP configuration

Add an SMTP account in Settings with the provider details supplied by the email provider, including host, port, encryption/secure setting, username, password or app password, sender name, and sender email. MailerJS encrypts the stored password and provides an SMTP connection test endpoint.

Use an application-specific password when a provider requires one. Do not put SMTP credentials in template content, campaign data, frontend variables, or queue payloads.

## Template personalization

Templates and campaign subjects support these variables:

| Variable | Replaced with |
| --- | --- |
| `{{first_name}}` | Recipient first name |
| `{{last_name}}` | Recipient last name |
| `{{email}}` | Recipient email address |

Example:

```text
Hi {{first_name}},

We have an update for {{email}}.
```

## API overview

All application routes are under `/api`. Protected routes use the session cookies and enforce user ownership for contacts, templates, SMTP accounts, campaigns, recipients, deliveries, and send runs.

| Area | Routes |
| --- | --- |
| User/authentication | `GET /users`, `POST /users/register`, `/users/login`, `/users/google`, `/users/google/reauthenticate`, `/users/refresh`, `/users/logout`, `PUT /users/update`, `PATCH /users/password`, `DELETE /users/delete` |
| Contacts | `GET, POST /contacts`; `PUT, DELETE /contacts/:id` |
| Templates | `GET, POST /templates`; `PUT, DELETE /templates/:id` |
| SMTP accounts | `GET, POST /smtp`; `PUT, DELETE /smtp/:id`; `POST /smtp/:id/test` |
| Campaigns | `GET, POST /campaigns`; `GET, PUT, DELETE /campaigns/:id` |
| Campaign recipients | `GET, POST /campaigns/:campaignId/recipients`; `DELETE /campaigns/:campaignId/recipients/:contactId` |
| Send runs | `POST /campaigns/:campaignId/send`; `GET /campaigns/:campaignId/sends`; `GET /campaigns/:campaignId/sends/:sendId` |
| Delivery history | `GET /campaigns/:campaignId/deliveries` |
| Dashboard | `GET /dashboard` |

The campaign send response and status endpoints expose send-run fields such as ID, status, recipient total, accepted/failed counts, timestamps, and a safe run-level error message. They never expose Redis job details or SMTP passwords.

## Testing and verification

Run the backend test suite:

```bash
cd backend
npm test
```

The backend uses Node's built-in test runner. Its focused tests cover authentication/Google verification behavior, campaign send creation and processing behavior, retry safety, and dashboard aggregation.

Run the frontend quality checks and production build:

```bash
cd frontend
npm run lint
npm run build
```

There is no frontend test script configured in `frontend/package.json`.

## Deployment notes

Deploy the following separately:

- **Frontend:** build with `npm run build` in `frontend`; serve the generated Vite static files with a suitable web host.
- **API:** install backend dependencies, apply `npx prisma migrate deploy`, configure the backend environment, and run `npm start`.
- **Worker:** use the same backend release and environment, then run `npm run worker` as a separate long-running process.
- **PostgreSQL and Redis:** make both reachable from the API and worker. Redis credentials belong only in `QUEUE_REDIS_URL` on backend services.

Set `FRONTEND_URL` to the deployed browser origin so credentialed CORS requests are accepted. Configure HTTPS in production so secure authentication cookies can be used correctly.

The worker handles `SIGINT` and `SIGTERM` by closing the BullMQ worker, queue resources, Redis connections, and Prisma connection cleanly. The API also closes queue resources and Prisma during shutdown.

## Security considerations

- Keep `.env` files, JWT secrets, SMTP encryption keys, database credentials, Redis URLs, and provider credentials out of version control.
- Use independent, long random values for `JWT_SECRET`, `REFRESH_SECRET`, and `SMTP_ENCRYPTION_KEY`.
- Store SMTP passwords only through the application so they are encrypted before persistence.
- Ensure `FRONTEND_URL`, cookie settings, HTTPS, and Google OAuth origins match the deployed domains.
- Campaign recipient content is user-scoped, and send/status/delivery routes check campaign ownership before returning or changing data.
- Treat SMTP acceptance as transport acceptance, not proof of inbox placement.

## Current scope and limitations

MailerJS currently provides recipient-based campaign sending with sequential worker processing. It does not include scheduled campaigns, campaign cancellation, provider-aware rate limiting, open/click tracking, inbox-delivery guarantees, or an unsubscribe-management system. Those capabilities would require additional product and operational design.

No license file is currently included in this repository. Add a license deliberately before distributing or reusing the project under specific terms.
