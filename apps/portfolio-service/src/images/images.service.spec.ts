import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImagesService } from './images.service';
import { DatabaseService } from '@database/database.service';
import { R2Service } from '../uploads/r2.service';

describe('ImagesService', () => {
  let service: ImagesService;
  let db: jest.Mocked<DatabaseService>;
  let r2: jest.Mocked<R2Service>;

  const mockImage = {
    id: 'img-1',
    project_id: 'proj-1',
    url: 'https://storage.example.com/images/test.png',
    image_type: 'mockup',
    created_at: new Date(),
  };

  const mockDb = { query: jest.fn() };
  const mockR2 = { uploadFile: jest.fn(), deleteFile: jest.fn() };
  const mockConfig = { get: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: R2Service, useValue: mockR2 },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
    db = module.get(DatabaseService);
    r2 = module.get(R2Service);
    jest.clearAllMocks();
  });

  describe('upload', () => {
    const payload = {
      projectId: 'proj-1',
      fileName: 'test.png',
      fileBuffer: Buffer.from('fake-image').toString('base64'),
      encoding: 'base64',
      mimeType: 'image/png',
      type: 'mockup',
    };

    it('should upload an image successfully', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ id: 'proj-1' }] })
        .mockResolvedValueOnce({ rows: [mockImage] });
      mockR2.uploadFile.mockResolvedValue('https://storage.example.com/images/test.png');

      const result = await service.upload(payload);

      expect(result.url).toBe(mockImage.url);
      expect(result.type).toBe('mockup');
    });

    it('should throw NotFoundException if project does not exist', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.upload(payload)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByProject', () => {
    it('should return images for a project', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [mockImage] });

      const result = await service.findByProject('proj-1');

      expect(result.data).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('should delete an image and its R2 file', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [mockImage] })
        .mockResolvedValueOnce({ rows: [] });
      mockR2.deleteFile.mockResolvedValue(undefined);

      const result = await service.remove('img-1');

      expect(result.deleted).toBe(true);
      expect(r2.deleteFile).toHaveBeenCalledWith('test.png');
    });

    it('should throw NotFoundException', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should not fail if R2 delete fails', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [mockImage] })
        .mockResolvedValueOnce({ rows: [] });
      mockR2.deleteFile.mockRejectedValue(new Error('R2 error'));

      const result = await service.remove('img-1');

      expect(result.deleted).toBe(true);
    });
  });
});
