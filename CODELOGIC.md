# CodeLogic - potfosin-BE

Arsitektur backend Portfolio Website yang dibangun dengan **NestJS Monorepo**.

---

## Daftar Isi

1. [Arsitektur Secara Umum](#1-arsitektur-secara-umum)
2. [Flow Request](#2-flow-request)
3. [Modul & Database Schema](#3-modul--database-schema)
4. [Autentikasi & Keamanan](#4-autentikasi--keamanan)
5. [Response Format](#5-response-format)
6. [Tutorial: Membuat Endpoint Baru](#6-tutorial-membuat-endpoint-baru)
7. [Perintah Penting](#7-perintah-penting)

---

## 1. Arsitektur Secara Umum

Proyecto ini menggunakan **NestJS Monorepo** dengan dua aplikasi dan dua library bersama:

```
potfosin-BE/
├── apps/
│   ├── api-gateway/          ← HTTP-facing (port 3000)
│   └── portfolio-service/    ← Business logic (port 4001)
├── libs/
│   ├── common/               ← Decorator, interceptor, filter, utils
│   └── database/             ← PostgreSQL connection pool
└── migrations/               ← SQL migration files
```

**Kuncinya**: `api-gateway` adalah wajah HTTP yang menerima request dari client. Ia mengimpor service langsung dari `portfolio-service` untuk menjalankan bisnis logic. `portfolio-service` juga bisa berjalan sebagai microservice TCP terpisah, tapi saat ini keduanya berjalan sebagai monolith dalam satu proses.

### Alur Koneksi

```
Client → API Gateway (port 3000)
              │
              ├── Middleware: CorrelationId → Logger → Auth
              │
              ├── Controller (thin proxy, menerima HTTP request)
              │       │
              │       └── Service (business logic + SQL queries)
              │               │
              │               └── DatabaseService (PostgreSQL pool)
              │
              └── Interceptor: Logging → Transform → Timeout
                        │
                        └── Response ke Client
```

---

## 2. Flow Request

Ketika client mengirim request ke server, berikut urutan yang terjadi:

### Step 1 - Middleware Pipeline

```
Request masuk
  → CorrelationIdMiddleware   (generate/baca x-correlation-id)
  → LoggerMiddleware          (log method, URL, status, duration)
  → AuthMiddleware            (cek JWT token, skip jika public path)
```

Public paths yang **tidak butuh auth**:
- `GET /api/v1/projects/*` (semua GET projects)
- `GET /api/v1/techs/*` (semua GET techs)
- `GET /api/v1/uploads/*`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/health`

### Step 2 - ValidationPipe

Request body di-validasi otomatis berdasarkan DTO class decorator:
```typescript
// Jika field tidak ada di DTO → di-strip (whitelist: true)
// Jika field asing ada di body → throw 400 error (forbidNonWhitelisted: true)
// Body di-transform ke instance DTO class (transform: true)
```

### Step 3 - Controller → Service → Database

```
Controller menerima request → panggil Service method → Service query PostgreSQL
```

### Step 4 - TransformInterceptor

Semua response sukses dibungkus dalam format standar:
```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "statusCode": 200,
  "timestamp": "2025-07-25T10:00:00.000Z"
}
```

### Step 5 - AllExceptionsFilter

Jika terjadi error, exception filter menangkap dan mengembalikan format error standar:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["name must be longer than or equal to 2 characters"],
  "statusCode": 400,
  "timestamp": "2025-07-25T10:00:00.000Z",
  "path": "/api/v1/projects"
}
```

---

## 3. Modul & Database Schema

### Database: PostgreSQL (raw SQL via `pg`)

Tidak ada ORM. Semua query ditulis manual menggunakan `DatabaseService.query()`.

**Tables:**

| Table | Keterangan |
|-------|------------|
| `users` | id (UUID), email (unique), name, password (hashed), role (user/owner/admin), timestamps |
| `techs` | id (UUID), name (unique), slug (unique), icon_url |
| `projects` | id (UUID), name, description, team_type (solo/team), github_link, design_link, status (complete/progress/paused), experience, start_date, end_date, priority (1-100), owner_id → users |
| `project_techs` | project_id → projects, tech_id → techs (junction table, many-to-many) |
| `project_images` | id (UUID), project_id → projects (CASCADE delete), url, image_type (mockup/post) |

**Relasi:**
```
users (1) ──── (∞) projects     [owner_id FK, ON DELETE SET NULL]
projects (∞) ──── (∞) techs     [melalui project_techs, CASCADE deletes]
projects (1) ──── (∞) project_images  [CASCADE delete]
```

### Existing Modules

| Module | Endpoint | Fungsi |
|--------|----------|--------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/profile` | Register, login, JWT |
| Projects | CRUD + pagination + filter by status/techId | CRUD project dengan relasi techs, images, owner |
| Techs | CRUD + slug uniqueness | CRUD technology stack |
| Users | CRUD + pagination | CRUD user |
| Uploads | POST upload + GET by project + DELETE | Upload gambar ke Cloudflare R2 |

---

## 4. Autentikasi & Keamanan

### JWT Auth Flow

```
1. User login → POST /auth/login
2. Server return { user, accessToken }
3. Client simpan accessToken, kirim di header: Authorization: Bearer <token>
4. AuthMiddleware verifikasi JWT → attach decoded payload ke req.user
5. Controller bisa akses (req as any).user untuk dapat userId, email, dll
```

**JWT Payload:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Keamanan Lainnya

- **Helmet**: Proteksi HTTP headers (CSP, XSS, dll)
- **Compression**: Gzip response
- **CORS**: Configurable via `CORS_ORIGIN` env
- **Rate Limiting**: Tidak ada (belum diimplementasi)
- **ValidationPipe**: `whitelist: true` + `forbidNonWhitelisted: true` → field asing otomatis dibuang/ditolak

---

## 5. Response Format

### Sukses (200/201)

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "uuid",
    "name": "Project Name",
    ...
  },
  "statusCode": 200,
  "timestamp": "2025-07-25T10:00:00.000Z"
}
```

### Sukses dengan Pagination

```json
{
  "success": true,
  "message": "Success",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  },
  "statusCode": 200,
  "timestamp": "..."
}
```

### Error

```json
{
  "success": false,
  "message": "Project not found",
  "errors": null,
  "statusCode": 404,
  "timestamp": "2025-07-25T10:00:00.000Z",
  "path": "/api/v1/projects/invalid-id"
}
```

---

## 6. Tutorial: Membuat Endpoint Baru

Mari kita buat endpoint untuk resource baru: **Categories** (contoh).

### Langkah 1 - Buat Migration

Buat file `migrations/007_create_categories.sql`:

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

Jalankan migration:
```bash
npm run migrate
```

### Langkah 2 - Buat DTO

Buat folder dan file `apps/portfolio-service/src/categories/dto/categories.dto.ts`:

```typescript
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

**Tips:**
- Setiap field harus pakai decorator `class-validator` (`@IsString`, `@IsEmail`, `@IsOptional`, dll)
- Field yang wajib diisi: tanpa `@IsOptional()`
- Field opsional: pakai `@IsOptional()` + tanda `?` di type

### Langkah 3 - Buat Service

Buat `apps/portfolio-service/src/categories/categories.service.ts`:

```typescript
import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateCategoryDto) {
    // Cek duplikat slug
    const existing = await this.db.query(
      'SELECT id FROM categories WHERE slug = $1',
      [dto.slug],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException('Category with this slug already exists');
    }

    const result = await this.db.query(
      `INSERT INTO categories (name, slug, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [dto.name, dto.slug, dto.description || null],
    );

    this.logger.log(`Category created: ${result.rows[0].name}`);
    return result.rows[0];
  }

  async findAll() {
    const result = await this.db.query('SELECT * FROM categories ORDER BY name ASC');
    return result.rows;
  }

  async findOne(id: string) {
    const result = await this.db.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Category not found');
    }
    return result.rows[0];
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.db.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new NotFoundException('Category not found');
    }

    // Cek slug duplikat jika slug diubah
    if (dto.slug && dto.slug !== existing.rows[0].slug) {
      const slugExists = await this.db.query(
        'SELECT id FROM categories WHERE slug = $1 AND id != $2',
        [dto.slug, id],
      );
      if (slugExists.rows.length > 0) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dto.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(dto.name);
    }
    if (dto.slug !== undefined) {
      fields.push(`slug = $${paramIndex++}`);
      values.push(dto.slug);
    }
    if (dto.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(dto.description);
    }

    if (fields.length === 0) return existing.rows[0];

    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await this.db.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    this.logger.log(`Category updated: ${result.rows[0].name}`);
    return result.rows[0];
  }

  async remove(id: string) {
    const result = await this.db.query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('Category not found');
    }
    this.logger.log(`Category deleted: ${id}`);
    return { deleted: true, id };
  }
}
```

**Pattern kunci dalam Service:**
- Inject `DatabaseService` untuk query PostgreSQL
- `create()` → INSERT ... RETURNING *
- `findAll()` → SELECT * ORDER BY
- `findOne(id)` → SELECT WHERE id = $1 + NotFoundException jika kosong
- `update(id, dto)` → Dynamic UPDATE (hanya field yang dikirim)
- `remove(id)` → DELETE WHERE id = $1 RETURNING id + NotFoundException jika kosong
- Selalu pakai `$1`, `$2`, ... untuk parameterized query (prevent SQL injection)

### Langkah 4 - Buat Controller di Portfolio Service

Buat `apps/portfolio-service/src/categories/categories.controller.ts`:

```typescript
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';

@Controller()
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @MessagePattern('categories.create')
  async create(@Payload() dto: CreateCategoryDto) {
    try {
      return await this.categoriesService.create(dto);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 400 });
    }
  }

  @MessagePattern('categories.findAll')
  async findAll() {
    try {
      return await this.categoriesService.findAll();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('categories.findOne')
  async findOne(@Payload() payload: { id: string }) {
    try {
      return await this.categoriesService.findOne(payload.id);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 404 });
    }
  }

  @MessagePattern('categories.update')
  async update(@Payload() payload: { id: string; data: UpdateCategoryDto }) {
    try {
      return await this.categoriesService.update(payload.id, payload.data);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 400 });
    }
  }

  @MessagePattern('categories.remove')
  async remove(@Payload() payload: { id: string }) {
    try {
      return await this.categoriesService.remove(payload.id);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 404 });
    }
  }
}
```

**Pattern kunci dalam Controller (Microservice):**
- Decorator `@MessagePattern('resource.action')` untuk menerima pesan TCP
- `@Payload()` untuk menerima data dari pesan
- Selalu bungkus dalam try/catch + `RpcException`
- Nama pattern: `{resource}.{action}` → `categories.create`, `categories.findAll`, dll

### Langkah 5 - Buat Controller di API Gateway

Buat `apps/api-gateway/src/controllers/category.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipAuth } from '../middleware/auth.middleware';
import { CategoriesService } from '../../../portfolio-service/src/categories/categories.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new category' })
  async create(@Body() dto: Record<string, any>) {
    return this.categoriesService.create(dto as any);
  }

  @Get()
  @SkipAuth()
  @ApiOperation({ summary: 'Get all categories (public)' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @SkipAuth()
  @ApiOperation({ summary: 'Get category by ID' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category by ID' })
  async update(@Param('id') id: string, @Body() dto: Record<string, any>) {
    return this.categoriesService.update(id, dto as any);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category by ID' })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
```

**Pattern kunci dalam Controller (Gateway):**
- Decorator `@Controller('categories')` → base route `/categories` (akan jadi `/api/v1/categories`)
- `@SkipAuth()` → untuk endpoint public (GET)
- `@HttpCode(HttpStatus.CREATED)` → untuk POST (201)
- `@HttpCode(HttpStatus.NO_CONTENT)` → untuk DELETE (204)
- `@Body() dto: Record<string, any>` → terima body apa saja, cast ke DTO di service
- Import service **langsung dari portfolio-service** via relative path

### Langkah 6 - Register ke App Modules

**6a. Register di Portfolio Service** (`apps/portfolio-service/src/app.module.ts`):

```typescript
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';

// Tambahkan ke arrays:
controllers: [
  // ... existing controllers
  CategoriesController,   // ← tambah
],
providers: [
  // ... existing providers
  CategoriesService,      // ← tambah
],
```

**6b. Register di API Gateway** (`apps/api-gateway/src/app.module.ts`):

```typescript
import { CategoryController } from './controllers/category.controller';
import { CategoriesService } from '../../portfolio-service/src/categories/categories.service';

// Tambahkan ke arrays:
controllers: [
  // ... existing controllers
  CategoryController,     // ← tambah
],
providers: [
  // ... existing providers
  CategoriesService,      // ← tambah
],
```

### Langkah 7 - (Opsional) Tambahkan ke AuthMiddleware

Jika endpoint GET harus public, tambahkan ke `apps/api-gateway/src/middleware/auth.middleware.ts`:

```typescript
private readonly publicGetPrefixes = [
  '/api/v1/projects',
  '/api/v1/techs',
  '/api/v1/uploads',
  '/api/v1/categories',   // ← tambah
];
```

### Selesai!

Sekarang endpoint sudah bisa diakses:

```
POST   /api/v1/categories        → Buat category (auth required)
GET    /api/v1/categories        → List semua (public)
GET    /api/v1/categories/:id    → Detail (public)
PUT    /api/v1/categories/:id    → Update (auth required)
DELETE /api/v1/categories/:id    → Hapus (auth required)
```

---

## 7. Perintah Penting

```bash
# Install dependencies
npm install

# Jalankan development
npm run start:dev

# Jalankan migration
npm run migrate

# Build production
npm run build

# Jalankan production
npm run start:prod

# Build specific app
nest build api-gateway
nest build portfolio-service
```

### Struktur File yang Dibutuhkan per Endpoint Baru

```
apps/portfolio-service/src/{resource}/
├── {resource}.controller.ts       # Microservice controller (@MessagePattern)
├── {resource}.service.ts          # Business logic + SQL queries
└── dto/
    └── {resource}.dto.ts          # Validation DTOs (class-validator)

apps/api-gateway/src/controllers/
└── {resource}.controller.ts       # HTTP controller (@Controller, @Get, @Post, dll)
```

---

## Referensi Cepat

### Service Response Pattern

```typescript
// Selalu return object yang konsisten
return result.rows[0];           // Single item
return { data: result.rows };    // List
return { deleted: true, id };    // Delete
```

### Error Handling Pattern

```typescript
import { NotFoundException, ConflictException } from '@nestjs/common';

// Jika data tidak ditemukan
if (rows.length === 0) {
  throw new NotFoundException('Resource not found');
}

// Jika duplikat
if (existing.rows.length > 0) {
  throw new ConflictException('Resource already exists');
}
```

### Database Query Pattern

```typescript
// Insert
await this.db.query(
  'INSERT INTO table (col1, col2) VALUES ($1, $2) RETURNING *',
  [value1, value2]
);

// Select with filter
await this.db.query(
  'SELECT * FROM table WHERE col1 = $1 AND col2 = $2 ORDER BY created_at DESC',
  [value1, value2]
);

// Update dynamic
const fields = [];
const values = [];
let idx = 1;
if (dto.name !== undefined) {
  fields.push(`name = $${idx++}`);
  values.push(dto.name);
}
values.push(id);
await this.db.query(
  `UPDATE table SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
  values
);

// Delete
await this.db.query('DELETE FROM table WHERE id = $1 RETURNING id', [id]);
```
