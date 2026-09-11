# Dreamview

Public construction site and admin panel. Start with **projects** (title, description, images). More content types can be added later without changing the storage or Docker setup.

**Stack:** Node.js, TypeScript, Fastify, React, PostgreSQL, Cloudinary.

Docker runs the app only. There is **no local database container** — point `DATABASE_URL` at Neon, Supabase, RDS, or any hosted Postgres.

## What you get

- Public home and projects gallery (published work only)
- Email/password admin session at `/admin`
- Project CRUD (`draft` / `scheduled` / `published`) with optional future publish time
- Multi-image upload, alt text, drag-to-reorder, delete
- Images stored on Cloudinary (not on disk, not in Postgres)
- Production image: API serves the built site + admin UI

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
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary account credentials |

### Image storage

Uploads go to Cloudinary under `projects/<project-id>/…`. `project_images.storage_key` is the Cloudinary public id; `url` is the `secure_url` returned on upload. Delete removes that public id (and invalidates the CDN).

### Local development

```bash
pnpm install
pnpm dev
```

- Public site: [http://localhost:5173](http://localhost:5173)
- Projects: [http://localhost:5173/projects](http://localhost:5173/projects)
- Admin: [http://localhost:5173/admin](http://localhost:5173/admin)
- API: [http://localhost:3000](http://localhost:3000)

The Vite dev server proxies `/api` to the API. Migrations and the first admin run when the API starts.

### Docker (app only)

```bash
docker compose up --build
```

Then open [http://localhost:3000](http://localhost:3000). The container talks to the hosted database and Cloudinary from `.env`.

## API

Admin project routes require a session cookie from `POST /api/auth/login`. The public list does not.

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/public/projects` | Live projects (`published`, or `scheduled` whose time has passed) |
| `GET` | `/api/public/projects/:slug` | One live project |
| `POST` | `/api/auth/login` | `{ email, password }` |
| `POST` | `/api/auth/logout` | |
| `GET` | `/api/auth/me` | |
| `GET` | `/api/projects` | |
| `POST` | `/api/projects` | `{ title, description, status, publishAt? }` |
| `GET` | `/api/projects/:id` | |
| `PATCH` | `/api/projects/:id` | |
| `DELETE` | `/api/projects/:id` | Also deletes Cloudinary assets |
| `POST` | `/api/projects/:id/images` | `multipart/form-data`, field `images` |
| `PATCH` | `/api/projects/:id/images/:imageId` | `{ alt }` |
| `PUT` | `/api/projects/:id/images/order` | `{ imageIds }` |
| `DELETE` | `/api/projects/:id/images/:imageId` | |
| `GET` | `/api/health` | `{ ok, database, storage }` |

Images: JPEG, PNG, WebP, AVIF · 10 MB each · 24 per project.

The API process runs a publish job every 30 seconds: `scheduled` rows whose `publishAt` is due become `published`. The public queries also check the clock, so a due project appears even if the job has not flipped the row yet.

## Layout

```
apps/api    Fastify + Drizzle + Cloudinary
apps/web    Public site + admin (Vite + Tailwind)
```

Content types later can follow the same pattern: a table, a module under `apps/api/src/modules`, and a page under `apps/web/src/pages`.
