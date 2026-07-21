# Potfosin Backend

Potfosin Backend adalah backend untuk aplikasi portfolio berbasis NestJS dengan arsitektur monorepo dan microservice. Aplikasi ini menangani autentikasi, manajemen project, teknologi, upload gambar, serta integrasi penyimpanan file ke Cloudflare R2.

## Tech Stack

- Node.js + TypeScript
- NestJS untuk arsitektur server-side modular dan scalable
- Monorepo workspace dengan dua aplikasi utama:
  - API Gateway: menangani request HTTP dari client
  - Portfolio Service: menangani logika bisnis dan akses data
- PostgreSQL sebagai database relasional
- Redis untuk caching
- Cloudflare R2 untuk penyimpanan file/image
- JWT + Passport untuk autentikasi
- Swagger untuk dokumentasi API
- Jest + ts-jest untuk testing
- Docker Compose untuk environment lokal

## Arsitektur

```text
Client ──► API Gateway ──► Portfolio Service
      │                │
      │                ├── PostgreSQL
      │                ├── Redis
      │                └── Cloudflare R2
      │
      └── Auth / JWT / Middleware
```

Aplikasi terbagi menjadi dua service terpisah agar lebih modular dan mudah dikembangkan secara mandiri.

## Struktur Proyek

- apps/api-gateway: entry point HTTP, routing, middleware, controller
- apps/portfolio-service: service bisnis, module project, tech, user, image
- libs/common: shared utilities, guards, decorators, interfaces
- libs/database: integrasi dan helper database
- migrations: file migrasi SQL untuk skema database
- scripts: migrasi dan seeding data

## Prerequisites

Pastikan sistem sudah memiliki:

- Node.js 20+
- npm atau pnpm
- PostgreSQL
- Redis
- Akun Cloudflare R2 untuk storage object

## Instalasi

```bash
git clone <repo-url> potfosin-be
cd potfosin-be
npm install
```

Buat file environment `.env` dan isi konfigurasi database, Redis, JWT, serta Cloudflare R2.

## Migrasi & Seed Data

```bash
npm run migrate
npm run seed
```

## Menjalankan Aplikasi

### Development

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

## Testing

```bash
npm test
```

## Default User

Akun default yang tersedia setelah seeding:

- admin@potfosin.com / password123
- owner@potfosin.com / password123
- user@potfosin.com / password123
