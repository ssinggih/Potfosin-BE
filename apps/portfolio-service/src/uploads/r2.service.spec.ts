import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { R2Service } from './r2.service';

describe('R2Service', () => {
  let service: R2Service;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        R2Service,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const env: Record<string, string> = {
                R2_ENDPOINT: 'https://r2.example.com',
                R2_ACCESS_KEY_ID: 'key',
                R2_SECRET_ACCESS_KEY: 'secret',
                R2_BUCKET_NAME: 'test-bucket',
                R2_PUBLIC_URL: 'https://cdn.example.com',
              };
              return env[key] || null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<R2Service>(R2Service);
    configService = module.get(ConfigService);
  });

  it('should initialize R2 client when credentials are present', () => {
    expect((service as any).client).toBeDefined();
    expect((service as any).bucketName).toBe('test-bucket');
  });

  it('should fallback to simulate when credentials missing', async () => {
    const module = await Test.createTestingModule({
      providers: [
        R2Service,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => null),
          },
        },
      ],
    }).compile();

    const svc = module.get<R2Service>(R2Service);
    expect((svc as any).client).toBeUndefined();
  });

  describe('uploadFile', () => {
    it('should simulate upload when R2 not configured', async () => {
      const module = await Test.createTestingModule({
        providers: [
          R2Service,
          {
            provide: ConfigService,
            useValue: { get: jest.fn(() => null) },
          },
        ],
      }).compile();

      const svc = module.get<R2Service>(R2Service);
      const result = await svc.uploadFile(Buffer.from('test'), 'image.png', 'image/png');

      expect(result).toContain('storage.example.com');
    });
  });

  describe('deleteFile', () => {
    it('should simulate delete when R2 not configured', async () => {
      const module = await Test.createTestingModule({
        providers: [
          R2Service,
          {
            provide: ConfigService,
            useValue: { get: jest.fn(() => null) },
          },
        ],
      }).compile();

      const svc = module.get<R2Service>(R2Service);
      await expect(svc.deleteFile('test.png')).resolves.toBeUndefined();
    });
  });
});
