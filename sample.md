# Potfosin — Portfolio Backend

NestJS monorepo microservices backend for a portfolio website.  
**PostgreSQL + Redis + Cloudflare R2.**

## Stack

| Layer | Tech |
|-------|------|
| Runtime | Node.js 20+, TypeScript 5 |
| Framework | NestJS 10 (monorepo) |
| Communication | TCP microservices via `@nestjs/microservices` |
| Database | PostgreSQL 16 with raw SQL (via `pg`) |
| Cache | Redis (via `ioredis`) — falls back to in-memory |
| File Storage | Cloudflare R2 (S3-compatible, via `@aws-sdk/client-s3`) |
| Auth | JWT (`@nestjs/jwt`) |
| Validation | `class-validator` + `class-transformer` |
| Security | `helmet`, `compression`, CORS |
| File Upload | `multer` via `@nestjs/platform-express` |
| Testing | Jest (27 suites, 134 tests) |
| Container | Docker / Docker Compose |

## Architecture

```
┌─────────────┐     TCP      ┌────────────────────┐
│  API Gateway │◄───────────►│ Portfolio Service  │
│  (HTTP :3000) │             │  (TCP :4001)       │
└──────┬──────┘             └─────────┬──────────┘
       │                              │
       ▼                              ▼
┌──────────────┐             ┌──────────────┐
│   Redis      │             │  PostgreSQL  │
│   (cache)    │             │  (database)  │
└──────────────┘             └──────┬───────┘
                                    │
                                    ▼
                           ┌──────────────┐
                           │ Cloudflare R2 │
                           │  (file store) │
                           └──────────────┘
```

## Project Structure

```
potfosin-be/
├── apps/
│   ├── api-gateway/             HTTP gateway (port 3000)
│   │   └── src/
│   │       ├── controllers/     auth, project, tech, user, upload
│   │       └── middleware/      auth (JWT), logger, correlation-id
│   │
│   └── portfolio-service/       Microservice (TCP port 4001)
│       └── src/
│           ├── auth/            register, login, JWT
│           ├── users/           CRUD users
│           ├── projects/        CRUD projects + tech relations
│           ├── techs/           CRUD techs
│           ├── images/          image management
│           └── uploads/         R2 file upload service
│
├── libs/
│   ├── common/                  Shared: filters, interceptors, decorators
│   └── database/                PostgreSQL connection pool (pg)
│
├── migrations/                  Raw SQL migration files
├── scripts/
│   ├── migrate.ts               Migration runner
│   └── seed.ts                  Seed default users
├── docker/
│   └── docker-compose.yml       PostgreSQL + Redis + apps
├── postman_collection.json      Complete API collection
└── Dockerfile
```

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `users` | 3 roles: `user` (read-only), `owner` (manage projects), `admin` (full) |
| `techs` | Technology tags (e.g. React, Node.js) with unique slug |
| `projects` | Portfolio projects: name, description, status, experience, team/solo |
| `project_techs` | Many-to-many: projects ↔ techs |
| `project_images` | Images (mockup/post) — URLs stored, actual files in Cloudflare R2 |

### Seed Users

| Email | Role | Password |
|-------|------|----------|
| admin@potfosin.com | `admin` | password123 |
| owner@potfosin.com | `owner` | password123 |
| user@potfosin.com | `user` | password123 |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis (optional — falls back to in-memory)
- npm

### 1. Clone & Install

```bash
git clone <repo-url> potfosin-be
cd potfosin-be
npm install
```

### 2. Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Database

```bash
# Option A: Docker
docker compose -f docker/docker-compose.yml up postgres -d

# Option B: Local PostgreSQL
createdb potfosin

# Run migrations
npm run migrate

# Seed default users
npm run seed
```

### 4. Start Services

You need **both** services running. Open two terminals:

```bash
# Terminal 1 — API Gateway (HTTP :3000)
npm run dev

# Terminal 2 — Portfolio Service (TCP :4001)
npm run dev:portfolio
```

Or in production:

```bash
# Terminal 1
npm run start:prod

# Terminal 2
npm run start:prod:portfolio
```

### 5. Verify

```bash
curl http://localhost:3000/api/v1/health
# → { "status": "ok", "service": "api-gateway" }

curl http://localhost:3000/api/v1/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{ "email": "owner@potfosin.com", "password": "password123" }'
# → { "data": { "accessToken": "eyJ...", "user": {...} } }
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Gateway dev (watch) — `nest start api-gateway --watch` |
| `npm run dev:portfolio` | Portfolio dev (watch) — `nest start portfolio-service --watch` |
| `npm run build` | Build all apps |
| `npm run start` | Gateway start (no watch) |
| `npm run start:gateway` | Gateway dev (watch) |
| `npm run start:portfolio` | Portfolio dev (watch) |
| `npm run start:prod` | Gateway production — `node dist/.../main` |
| `npm run start:prod:portfolio` | Portfolio production |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed default users |
| `npm test` | Run all test suites (27 suites / 134 tests) |
| `npm run lint` | Lint all TS files |

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, get JWT |
| GET | `/auth/profile` | JWT | Current user profile |

### Projects

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/projects` | No | List projects (public) — supports `?status=complete&page=1&limit=10` |
| GET | `/projects/:id` | No | Get project detail |
| POST | `/projects` | JWT | Create project |
| PUT | `/projects/:id` | JWT | Update project (full) |
| PATCH | `/projects/:id` | JWT | Partial update |
| DELETE | `/projects/:id` | JWT | Delete project |

### Techs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/techs` | No | List techs (public) |
| GET | `/techs/:id` | No | Get tech detail |
| POST | `/techs` | JWT | Create tech |
| PUT | `/techs/:id` | JWT | Update tech |
| DELETE | `/techs/:id` | JWT | Delete tech |

### Users (admin only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users` | JWT | List users |
| GET | `/users/:id` | JWT | Get user |
| POST | `/users` | JWT | Create user |
| PUT | `/users/:id` | JWT | Update user |
| DELETE | `/users/:id` | JWT | Delete user |

### Uploads

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/uploads/:projectId/:type` | JWT | Upload image (`mockup` or `post`) |
| GET | `/uploads/:projectId` | No | Get project images |
| DELETE | `/uploads/:id` | JWT | Delete image |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Service health check |

## Postman Collection

Import `postman_collection.json` into Postman.

**Workflow:**
1. Run **Login (owner)** → auto-sets `{{token}}` and `{{user_id}}`
2. Run **Create Tech** → auto-sets `{{tech_id}}`
3. Run **Create Project** → auto-sets `{{project_id}}`
4. Run other endpoints as needed

Variables (`{{base_url}}`, `{{token}}`, `{{project_id}}`, `{{tech_id}}`, etc.) auto-populate via test scripts.

## Docker

```bash
# Start all services
docker compose -f docker/docker-compose.yml up -d

# Run migrations inside container
docker exec potfosin-portfolio-service npm run migrate

# Seed data
docker exec potfosin-portfolio-service npm run seed
```

## Testing

```bash
# Run all tests
npm test

# 27 test suites, 134 tests — all passing
# Covers: all services, controllers, middleware, interceptors, filters, decorators, utils, database
```
