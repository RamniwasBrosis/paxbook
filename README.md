# Paxbook Platform

Multi-tenant travel-booking SaaS. This repo currently implements **Phase 1, Checkpoint 1**: foundation, auth, and RBAC for the Admin Module. See `docs/architecture` (and the approved plan history) for the full four-phase roadmap.

## Apps

- `apps/api` — NestJS backend (source of truth for all business logic; every frontend talks to this).
- `apps/admin` — Next.js admin panel. **Real** in this checkpoint.
- `apps/user` — Next.js public site. Skeleton only until Phase 2.
- `apps/vendor` — Next.js vendor portal. Skeleton only until Phase 3.

## Prerequisites

- Node.js 20+
- pnpm (`corepack enable` or `npm i -g pnpm`)
- Docker Desktop (Postgres + Redis for local dev)

## First-time setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start Postgres + Redis
docker compose -f docker/docker-compose.yml up -d

# 3. Apply the database schema and seed default data
pnpm db:migrate
pnpm db:seed

# 4. Run everything
pnpm dev
```

- API: http://localhost:4000/api/v1 (Swagger docs at http://localhost:4000/api/docs)
- Admin: http://localhost:3000

### Seeded accounts (from `pnpm db:seed`)

| Email | Password | Role | Notes |
|---|---|---|---|
| admin@paxbook.test | PaxbookAdmin@123 | SuperAdmin | Full access |
| editor@paxbook.test | PaxbookEditor@123 | ContentEditor | No `users.*`/`finance.*` — use to verify RBAC 403s |

## Checkpoint 1 verification

1. Log in as `admin@paxbook.test` — dashboard loads with real counts (admin users, roles, audit log entries).
2. Go to Settings → Admin Users, create a new user — it appears in the list immediately, and a new row appears in Settings → Audit Log.
3. Log out, log back in as `editor@paxbook.test` — Settings → Admin Users shows a "Permission required" screen instead of the user list/form (client-side), and the underlying `GET/POST /api/v1/users` calls return `403 INSUFFICIENT_PERMISSIONS` if called directly (verify via Swagger or curl).
4. Refresh the admin page while logged in — the session survives (silent refresh via the httpOnly cookie), without needing to log in again.
