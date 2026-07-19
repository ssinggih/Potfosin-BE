import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { CreateTechDto, UpdateTechDto } from './dto/techs.dto';

@Injectable()
export class TechsService {
  private readonly logger = new Logger(TechsService.name);

  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateTechDto) {
    const existing = await this.db.query(
      'SELECT id FROM techs WHERE slug = $1',
      [dto.slug],
    );

    if (existing.rows.length > 0) {
      throw new ConflictException('Tech with this slug already exists');
    }

    const result = await this.db.query(
      `INSERT INTO techs (name, slug, icon_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [dto.name, dto.slug, dto.iconUrl || null],
    );

    this.logger.log(`Tech created: ${result.rows[0].name}`);
    return result.rows[0];
  }

  async findAll() {
    const result = await this.db.query('SELECT * FROM techs ORDER BY name ASC');
    return { data: result.rows, total: result.rows.length };
  }

  async findOne(id: string) {
    const result = await this.db.query('SELECT * FROM techs WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Tech not found');
    }
    return result.rows[0];
  }

  async update(id: string, dto: UpdateTechDto) {
    const existing = await this.db.query('SELECT * FROM techs WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new NotFoundException('Tech not found');
    }

    if (dto.slug && dto.slug !== existing.rows[0].slug) {
      const slugExists = await this.db.query(
        'SELECT id FROM techs WHERE slug = $1 AND id != $2',
        [dto.slug, id],
      );
      if (slugExists.rows.length > 0) {
        throw new ConflictException('Tech with this slug already exists');
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
    if (dto.iconUrl !== undefined) {
      fields.push(`icon_url = $${paramIndex++}`);
      values.push(dto.iconUrl);
    }

    if (fields.length === 0) return existing.rows[0];

    values.push(id);
    const result = await this.db.query(
      `UPDATE techs SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING *`,
      values,
    );

    this.logger.log(`Tech updated: ${result.rows[0].name}`);
    return result.rows[0];
  }

  async remove(id: string) {
    const result = await this.db.query(
      'DELETE FROM techs WHERE id = $1 RETURNING id',
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Tech not found');
    }

    return { deleted: true, id };
  }
}
