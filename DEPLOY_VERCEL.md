# Deploy ke Vercel

## Prasyarat

- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)
- Akun [Neon](https://neon.tech) (PostgreSQL serverless — gratis)
- Akun [Cloudflare R2](https://cloudflare.com) (storage gambar)

## 1. Setup Database (Neon)

1. Login ke [Neon Console](https://console.neon.tech)
2. Create project → dapatkan `DATABASE_URL`:
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require
   ```
3. Jalankan migration & seed dari lokal:
   ```bash
   DATABASE_URL="postgresql://neondb_owner:npg_li2ExHOucdy5@ep-holy-sea-azhbg0ca-pooler.c-3.ap-southeast-1.aws.neon.tech/potfosin?sslmode=require&channel_binding=require" npm run migrate
   DATABASE_URL="postgresql://neondb_owner:npg_li2ExHOucdy5@ep-holy-sea-azhbg0ca-pooler.c-3.ap-southeast-1.aws.neon.tech/potfosin?sslmode=require&channel_binding=require" npm run seed
   ```

## 2. Environment Variables

Set di **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable               | Contoh                                         | Keterangan           |
| ---------------------- | ---------------------------------------------- | -------------------- |
| `NODE_ENV`             | `production`                                   |                      |
| `GATEWAY_PREFIX`       | `api/v1`                                       | Prefix API           |
| `JWT_SECRET`           | `your-random-secret-123`                       | Rahasia JWT          |
| `JWT_EXPIRES_IN`       | `1d`                                           | Masa berlaku token   |
| `DATABASE_URL`         | `postgresql://...neon.tech/db?sslmode=require` | Koneksi Neon         |
| `R2_ENDPOINT`          | `https://xxx.r2.cloudflarestorage.com`         | Endpoint R2          |
| `R2_ACCESS_KEY_ID`     | dari Cloudflare R2                             | Access Key           |
| `R2_SECRET_ACCESS_KEY` | dari Cloudflare R2                             | Secret Key           |
| `R2_BUCKET_NAME`       | `portfosin-image`                              | Nama bucket          |
| `R2_PUBLIC_URL`        | `https://pub-xxx.r2.dev`                       | URL publik bucket    |
| `CORS_ORIGIN`          | `https://your-fe.vercel.app`                   | Domain frontend      |
| `REDIS_TTL`            | `3600`                                         | Cache TTL (opsional) |

> Jangan set `DB_HOST`, `DB_PORT`, dll satu-satu — pakai `DATABASE_URL` saja.

## 3. Deploy

### Via Vercel CLI

```bash
# Login
vercel login

# Deploy
vercel --prod
```

### Via Git (Vercel Dashboard)

1. Push repo ke GitHub
2. Vercel Dashboard → Add New Project → Import repo
3. Framework: **Other**
4. Build Command: **kosongkan** (biarkan default — `vercel.json` di repo sudah ada `buildCommand`)
5. Output Directory: **kosongkan** (sama, `vercel.json` sudah ada `outputDirectory`)
6. Set environment variables (tabel di atas)
7. Deploy

## 4. File Penting untuk Vercel

| File           | Fungsi                                                               |
| -------------- | -------------------------------------------------------------------- |
| `api/index.ts` | Serverless handler — bootstrap NestJS + `@vendia/serverless-express` |
| `vercel.json`  | Routing — semua request `/*` → `api/index.ts`                        |

## 5. Arsitektur

Sebelumnya ada **API Gateway + Portfolio Service (TCP microservice)**. Vercel tidak support TCP, jadi sekarang digabung jadi **satu aplikasi monolitik** — portfolio services langsung di-inject ke gateway.

```
Request → api/index.ts → NestJS AppModule
                           ├── AuthService
                           ├── ProjectsService
                           ├── TechsService
                           ├── UsersService
                           ├── ImagesService
                           └── R2Service (Cloudflare R2)
                                    ↓
                           DatabaseService → PostgreSQL (Neon)
```

## Catatan

- **Cold start** serverless ~1-5 detik (khas Vercel)
- **Upload gambar** lewat server — untuk file kecil ok. Untuk production disarankan **presigned URL** (client upload langsung ke R2)
- Vercel free plan: timeout **10 detik**, 100 GB bandwidth/bulan
- Migration & seed **tidak bisa** dijalankan di Vercel (read-only filesystem) — jalankan dari lokal ke Neon
