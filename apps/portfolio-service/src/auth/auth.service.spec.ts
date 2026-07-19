import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { DatabaseService } from '@database/database.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let db: jest.Mocked<DatabaseService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    name: 'Test',
    password: '$2b$10$hashedpassword',
    role: 'user',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockDb = {
    query: jest.fn(),
  };

  const mockConfig = { get: jest.fn() };
  const mockJwt = { sign: jest.fn(), verify: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: ConfigService, useValue: mockConfig },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    db = module.get(DatabaseService);
    jwtService = module.get(JwtService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto = { email: 'new@example.com', name: 'New', password: 'password123' };

    it('should register a new user', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockUser] });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockJwt.sign.mockReturnValue('token123');

      const result = await service.register(dto);

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBe('token123');
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([dto.email, dto.name]),
      );
    });

    it('should throw ConflictException if email exists', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'exists' }] });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'password123' };

    it('should login successfully', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwt.sign.mockReturnValue('token123');

      const result = await service.login(dto);

      expect(result.accessToken).toBe('token123');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password wrong', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await service.getProfile(mockUser.id);

      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.getProfile('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
