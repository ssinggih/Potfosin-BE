import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '@database/database.service';
import { R2Service } from '../uploads/r2.service';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly r2Service: R2Service,
    private readonly configService: ConfigService,
  ) {}

  async upload(payload: {
    projectId: string;
    fileName: string;
    fileBuffer: string;
    encoding?: string;
    mimeType: string;
    type: string;
  }) {
    const project = await this.db.query('SELECT id FROM projects WHERE id = $1', [
      payload.projectId,
    ]);

    if (project.rows.length === 0) {
      throw new NotFoundException('Project not found');
    }

    const buffer = payload.encoding === 'base64'
      ? Buffer.from(payload.fileBuffer, 'base64')
      : Buffer.isBuffer(payload.fileBuffer)
        ? payload.fileBuffer
        : Buffer.from(payload.fileBuffer as any);

    const uploadedUrl = await this.r2Service.uploadFile(
      buffer,
      payload.fileName,
      payload.mimeType,
    );

    const result = await this.db.query(
      `INSERT INTO project_images (project_id, url, image_type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [payload.projectId, uploadedUrl, payload.type],
    );

    const image = result.rows[0];
    this.logger.log(`Image ${payload.type} uploaded for project ${payload.projectId}`);

    return {
      id: image.id,
      url: image.url,
      type: image.image_type,
      projectId: image.project_id,
      createdAt: image.created_at,
    };
  }

  async findByProject(projectId: string) {
    const result = await this.db.query(
      `SELECT id, url, image_type as type, created_at
       FROM project_images WHERE project_id = $1
       ORDER BY created_at DESC`,
      [projectId],
    );

    return { data: result.rows };
  }

  async remove(id: string) {
    const image = await this.db.query(
      'SELECT * FROM project_images WHERE id = $1',
      [id],
    );

    if (image.rows.length === 0) {
      throw new NotFoundException('Image not found');
    }

    const fileName = image.rows[0].url.split('/').pop();
    if (fileName) {
      await this.r2Service.deleteFile(fileName).catch((err) => {
        this.logger.warn(`Failed to delete file from R2: ${err.message}`);
      });
    }

    await this.db.query('DELETE FROM project_images WHERE id = $1', [id]);
    this.logger.log(`Image deleted: ${id}`);

    return { deleted: true, id };
  }
}
