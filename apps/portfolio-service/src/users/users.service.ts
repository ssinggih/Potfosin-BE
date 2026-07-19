import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '@database/database.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.db.query(
      'SELECT id FROM users WHERE email = $1',
      [dto.email],
    );

    if (existing.rows.length > 0) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const result = await this.db.query(
      `INSERT INTO users (email, name, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at`,
      [dto.email, dto.name, hashedPassword, dto.role || 'user'],
    );

    return result.rows[0];
  }

  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const countResult = await this.db.query('SELECT COUNT(*) as count FROM users');
    const total = Number(countResult.rows[0].count);

    const result = await this.db.query(
      `SELECT id, email, name, role, created_at, updated_at
       FROM users ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return {
      data: result.rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const result = await this.db.query(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    return result.rows[0];
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dto.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(dto.email);
    }
    if (dto.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(dto.name);
    }
    if (dto.role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      values.push(dto.role);
    }

    if (fields.length === 0) {
      return this.findOne(id);
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await this.db.query(
      `UPDATE users SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, email, name, role, created_at, updated_at`,
      values,
    );

    return result.rows[0];
  }

  async remove(id: string) {
    const result = await this.db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    return { deleted: true, id };
  }
}
