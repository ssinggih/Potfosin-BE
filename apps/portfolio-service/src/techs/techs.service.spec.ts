import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TechsService } from './techs.service';
import { DatabaseService } from '@database/database.service';

describe('TechsService', () => {
  let service: TechsService;
  let db: jest.Mocked<DatabaseService>;

  const mockTech = {
    id: 'tech-1',
    name: 'React',
    slug: 'react',
    icon_url: 'https://example.com/react.svg',
  };

  const mockDb = { query: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechsService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get<TechsService>(TechsService);
    db = module.get(DatabaseService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = { name: 'React', slug: 'react', iconUrl: 'https://example.com/react.svg' };

    it('should create a tech', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockTech] });

      const result = await service.create(dto);

      expect(result.name).toBe('React');
      expect(result.slug).toBe('react');
    });

    it('should throw ConflictException if slug exists', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'exists' }] });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all techs', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [mockTech] });

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a tech', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [mockTech] });

      const result = await service.findOne('tech-1');

      expect(result.id).toBe('tech-1');
    });

    it('should throw NotFoundException', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a tech', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [mockTech] })
        .mockResolvedValueOnce({ rows: [{ ...mockTech, name: 'React.js' }] });

      const result = await service.update('tech-1', { name: 'React.js' });

      expect(result).toBeDefined();
    });

    it('should check slug uniqueness on update', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [mockTech] })
        .mockResolvedValueOnce({ rows: [{ id: 'other' }] });

      await expect(service.update('tech-1', { slug: 'taken' })).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.update('nonexistent', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a tech', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'tech-1' }] });

      const result = await service.remove('tech-1');

      expect(result.deleted).toBe(true);
    });

    it('should throw NotFoundException', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
