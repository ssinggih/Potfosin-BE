import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { DatabaseService } from '@database/database.service';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let db: jest.Mocked<DatabaseService>;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'user@example.com',
    name: 'User',
    password: 'hashed',
    role: 'user',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockDb = { query: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    db = module.get(DatabaseService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = { email: 'new@example.com', name: 'New', password: 'pass123', role: 'owner' as const };

    it('should create a user', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockUser] });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictException if email exists', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'exists' }] });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [mockUser] });

      const result = await service.findAll(1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await service.findOne(mockUser.id);

      expect(result.email).toBe(mockUser.email);
    });

    it('should throw NotFoundException', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ id: mockUser.id }] })
        .mockResolvedValueOnce({ rows: [{ ...mockUser, name: 'Updated' }] });

      const result = await service.update(mockUser.id, { name: 'Updated' });

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.update('nonexistent', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: mockUser.id }] });

      const result = await service.remove(mockUser.id);

      expect(result.deleted).toBe(true);
    });

    it('should throw NotFoundException', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
