import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { CreateProjectDto, UpdateProjectDto, ProjectFilterDto } from './dto/projects.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateProjectDto) {
    const result = await this.db.query(
      `INSERT INTO projects (name, description, team_type, github_link, design_link, status, experience, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        dto.name,
        dto.description,
        dto.teamType,
        dto.githubLink || null,
        dto.designLink || null,
        dto.status || 'progress',
        dto.experience || null,
        dto.ownerId || null,
      ],
    );

    const project = result.rows[0];

    if (dto.techIds && dto.techIds.length > 0) {
      for (const techId of dto.techIds) {
        await this.db.query(
          'INSERT INTO project_techs (project_id, tech_id) VALUES ($1, $2)',
          [project.id, techId],
        );
      }
    }

    this.logger.log(`Project created: ${project.name} (${project.id})`);
    return this.getProjectWithRelations(project.id);
  }

  async findAll(filter: ProjectFilterDto) {
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (filter.status) {
      whereClause += ` WHERE p.status = $${paramIndex++}`;
      params.push(filter.status);
    }

    if (filter.techId) {
      const techWhere = ` WHERE p.id IN (SELECT project_id FROM project_techs WHERE tech_id = $${paramIndex++})`;
      whereClause = whereClause || techWhere;
      params.push(filter.techId);
    }

    const countResult = await this.db.query(
      `SELECT COUNT(*) as count FROM projects p${whereClause}`,
      params,
    );
    const total = Number(countResult.rows[0].count);

    params.push(limit);
    params.push(offset);

    const result = await this.db.query(
      `SELECT * FROM projects p${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      params,
    );

    const enriched = await Promise.all(
      result.rows.map((p: any) => this.getProjectRelations(p)),
    );

    return {
      data: enriched,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const project = await this.getProjectWithRelations(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const existing = await this.db.query('SELECT id FROM projects WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new NotFoundException('Project not found');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      name: 'name',
      description: 'description',
      teamType: 'team_type',
      githubLink: 'github_link',
      designLink: 'design_link',
      status: 'status',
      experience: 'experience',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if ((dto as any)[key] !== undefined) {
        fields.push(`${col} = $${paramIndex++}`);
        values.push((dto as any)[key]);
      }
    }

    if (fields.length > 0) {
      fields.push('updated_at = NOW()');
      values.push(id);

      await this.db.query(
        `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values,
      );
    }

    if (dto.techIds !== undefined) {
      await this.db.query('DELETE FROM project_techs WHERE project_id = $1', [id]);
      if (dto.techIds.length > 0) {
        for (const techId of dto.techIds) {
          await this.db.query(
            'INSERT INTO project_techs (project_id, tech_id) VALUES ($1, $2)',
            [id, techId],
          );
        }
      }
    }

    this.logger.log(`Project updated: ${id}`);
    return this.getProjectWithRelations(id);
  }

  async remove(id: string) {
    const result = await this.db.query(
      'DELETE FROM projects WHERE id = $1 RETURNING id',
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Project not found');
    }

    this.logger.log(`Project deleted: ${id}`);
    return { deleted: true, id };
  }

  private async getProjectWithRelations(projectId: string) {
    const result = await this.db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (result.rows.length === 0) return null;
    return this.getProjectRelations(result.rows[0]);
  }

  private async getProjectRelations(project: any) {
    const techsResult = await this.db.query(
      `SELECT t.id, t.name, t.slug, t.icon_url
       FROM techs t
       JOIN project_techs pt ON t.id = pt.tech_id
       WHERE pt.project_id = $1`,
      [project.id],
    );

    const imagesResult = await this.db.query(
      `SELECT id, url, image_type as type, created_at
       FROM project_images WHERE project_id = $1
       ORDER BY created_at DESC`,
      [project.id],
    );

    let owner = null;
    if (project.owner_id) {
      const ownerResult = await this.db.query(
        'SELECT id, email, name FROM users WHERE id = $1',
        [project.owner_id],
      );
      owner = ownerResult.rows[0] || null;
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      teamType: project.team_type,
      githubLink: project.github_link,
      designLink: project.design_link,
      status: project.status,
      experience: project.experience,
      owner,
      techs: techsResult.rows,
      images: imagesResult.rows,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }
}
