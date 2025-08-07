# mc-webstore

Monorepo for mc-webstore: a modern, type-safe web store built with Next.js apps for Web, Server APIs, and Fumadocs documentation. Product/category data for the demo is served from data/data.ts.

## Tech Stack

- Monorepo: Turborepo, Bun
- Frontend (apps/web): Next.js (App Router), React, TypeScript, TailwindCSS, shadcn/ui
- Docs (apps/fumadocs): Next.js + Fumadocs (MDX)
- Backend (apps/server): Next.js (route handlers), oRPC, Better Auth, Drizzle ORM, PostgreSQL
- DB/ORM: Drizzle + Postgres
- Auth: Better Auth (email/password)
- Icons/UI: lucide-react, shadcn/ui

## Workspace Structure

```
.
├─ apps/
│  ├─ web/        # Web UI (Next.js)
│  ├─ server/     # API & auth (Next.js, oRPC)
│  └─ fumadocs/   # Documentation site (Fumadocs)
├─ data/
│  └─ data.ts     # Demo product/category data used by web
└─ package.json   # Turbo/Bun scripts
```

## Prerequisites

- Node/Bun: Bun 1.2+
- PostgreSQL (if using the server app)

## Setup

```bash
bun install
```

If running the server app with Postgres + Drizzle, copy env and push schema:

```bash
cp apps/server/.env.example apps/server/.env
bun db:push
```

## Development

- Start all apps:
```bash
bun dev
```
- Start only web:
```bash
bun dev:web
```
- Start only server:
```bash
bun dev:server
```

Web: http://localhost:3001
API: http://localhost:3000

## Data Source

The storefront reads demo data from data/data.ts. Replace with real APIs or database as needed.

## Scripts

- dev: turbo dev
- build: turbo build
- check-types: turbo check-types
- db:push | db:studio | db:generate | db:migrate (scoped to apps/server)

## Fumadocs

Docs live in apps/fumadocs. Add MDX under apps/fumadocs/content/docs. Start docs with the root dev command; Fumadocs will be served by its Next.js app.

## Contributing

- Use TypeScript
- Follow existing patterns and do not commit secrets
