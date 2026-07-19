import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get('R2_ENDPOINT');
    const accessKeyId = this.configService.get('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('R2_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get('R2_BUCKET_NAME', 'potfosin-images');
    this.publicUrl = this.configService.get('R2_PUBLIC_URL', '');

    this.logger.log(`R2_ENDPOINT: ${endpoint ? '✓ set' : '✗ null'}`);
    this.logger.log(`R2_ACCESS_KEY_ID: ${accessKeyId ? '✓ set' : '✗ null'}`);
    this.logger.log(`R2_SECRET_ACCESS_KEY: ${secretAccessKey ? '✓ set' : '✗ null'}`);
    this.logger.log(`R2_BUCKET_NAME: ${this.bucketName}`);

    if (endpoint && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log('R2 client initialized');
    } else {
      this.logger.warn('R2 credentials not configured. Uploads will be simulated.');
    }
  }

  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<string> {
    if (!this.client) {
      return this.simulateUpload(originalName);
    }

    const ext = originalName.split('.').pop() || 'png';
    const key = `portofolio-mockup-image/${uuidv4()}.${ext}`;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );

      const url = this.publicUrl
        ? `${this.publicUrl}/${key}`
        : `${this.configService.get('R2_ENDPOINT')}/${this.bucketName}/${key}`;

      this.logger.log(`File uploaded to R2: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`R2 upload failed: ${error.message}`);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    if (!this.client) {
      this.logger.warn(`Simulated delete: ${fileName}`);
      return;
    }

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: `portofolio-mockup-image/${fileName}`,
        }),
      );
      this.logger.log(`File deleted from R2: ${fileName}`);
    } catch (error) {
      this.logger.error(`R2 delete failed: ${error.message}`);
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  private simulateUpload(originalName: string): string {
    const ext = originalName.split('.').pop() || 'png';
    const mockUrl = `https://storage.example.com/portofolio-mockup-image/${uuidv4()}.${ext}`;
    this.logger.warn(`Simulated upload (R2 not configured): ${mockUrl}`);
    return mockUrl;
  }
}
