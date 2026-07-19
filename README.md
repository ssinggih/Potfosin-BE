# Potfosin — Portfolio Backend

NestJS monorepo microservices backend with **PostgreSQL + Cloudflare R2**.

## Architecture

```
Gateway (HTTP :3000) ──TCP──► Portfolio Service (TCP :4001)
        │                              │
        ▼                              ▼
     Redis (cache)              PostgreSQL (DB)
                                     │
                                     ▼
                              Cloudflare R2 (files)
```

Two separate NestJS apps: **API Gateway** handles HTTP, **Portfolio Service** handles business logic. Communication via TCP.

## Install

```bash
git clone <repo-url> potfosin-be && cd potfosin-be
npm install
cp .env.example .env          # Edit with your DB & R2 credentials
npm run migrate                 # Create tables
npm run seed                    # Seed 3 default users
```

## Run

### Development (watch mode)

```bash
# Terminal 1 — Gateway
npm run dev

# Terminal 2 — Portfolio Service
npm run dev:portfolio
```

### Production

```bash
# Terminal 1
npm run start:prod

# Terminal 2
npm run start:prod:portfolio
```

### Verify

```bash
curl http://localhost:3000/api/v1/health
```

Default users: `admin@potfosin.com`, `owner@potfosin.com`, `user@potfosin.com` — all with password `password123`.
