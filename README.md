# Dreamview Admin

Admin panel for a construction company site. Start with **projects** (title, description, images). More content types can be added later without changing the storage or Docker setup.

**Stack:** Node.js, TypeScript, Fastify, React, PostgreSQL, S3-compatible object storage.

Docker runs the app only. There is **no local database container** — point `DATABASE_URL` at Neon, Supabase, RDS, or any hosted Postgres.

## What you get

- Email/password admin session
- Project CRUD (`draft` / `published`)
- Multi-image upload, alt text, drag-to-reorder, delete
- Images stored in S3 / R2 / Spaces (not on disk, not in Postgres)
- Production image: API serves the built admin UI

## Setup

```bash
cp .env.example .env
```

Fill in:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Hosted Postgres. Use `?sslmode=require` for most clouds. |
| `SESSION_SECRET` | At least 32 random characters (`openssl rand -hex 32`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin, created on boot if the table is empty |
| `S3_*` | Bucket credentials and a public URL for serving images |

### Object storage

Works with any S3 API:

- **Cloudflare R2:** set `S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com`, `S3_REGION=auto`, `S3_FORCE_PATH_STYLE=true`, and `S3_PUBLIC_URL` to your R2 public/custom domain.
- **AWS S3:** leave `S3_ENDPOINT` empty. Set `S3_PUBLIC_URL` to the virtual-host URL or a CloudFront domain (`https://bucket.s3.region.amazonaws.com`).
- **DigitalOcean Spaces:** set the regional endpoint and `S3_FORCE_PATH_STYLE=true`.

The app writes objects to `projects/<project-id>/…`. Make that prefix publicly readable (bucket policy or a CDN). Do not enable ACLs on the PutObject call.

### Local development

```bash
pnpm install
pnpm dev
```

- Admin UI: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3000](http://localhost:3000)

The Vite dev server proxies `/api` to the API. Migrations and the first admin run when the API starts.

### Docker (app only)

```bash
docker compose up --build
```

Then open [http://localhost:3000](http://localhost:3000). The container talks to the hosted database and object store from `.env`.

## API

All project routes require a session cookie from `POST /api/auth/login`.

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/auth/login` | `{ email, password }` |
| `POST` | `/api/auth/logout` | |
| `GET` | `/api/auth/me` | |
| `GET` | `/api/projects` | |
| `POST` | `/api/projects` | `{ title, description, status }` |
| `GET` | `/api/projects/:id` | |
| `PATCH` | `/api/projects/:id` | |
| `DELETE` | `/api/projects/:id` | Also deletes objects in storage |
| `POST` | `/api/projects/:id/images` | `multipart/form-data`, field `images` |
| `PATCH` | `/api/projects/:id/images/:imageId` | `{ alt }` |
| `PUT` | `/api/projects/:id/images/order` | `{ imageIds }` |
| `DELETE` | `/api/projects/:id/images/:imageId` | |
| `GET` | `/api/health` | `{ ok, database, storage }` |

Images: JPEG, PNG, WebP, AVIF · 10 MB each · 24 per project.

## Layout

```
apps/api    Fastify + Drizzle + S3
apps/web    React admin (Vite + Tailwind)
```

Content types later can follow the same pattern: a table, a module under `apps/api/src/modules`, and a page under `apps/web/src/pages`.
