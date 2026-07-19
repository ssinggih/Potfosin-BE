import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const mockService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return registered user', async () => {
      const result = { user: { id: '1', email: 'test@test.com' }, accessToken: 'token' };
      mockService.register.mockResolvedValue(result);

      const res = await controller.register({ email: 'test@test.com', name: 'Test', password: 'pass123' });

      expect(res.accessToken).toBe('token');
    });

    it('should throw RpcException on conflict', async () => {
      mockService.register.mockRejectedValue(new ConflictException('Email already registered'));

      await expect(controller.register({ email: 't@t.com', name: 'T', password: 'pass123' }))
        .rejects.toThrow(RpcException);
    });
  });

  describe('login', () => {
    it('should return token', async () => {
      const result = { user: { id: '1', email: 'test@test.com' }, accessToken: 'token' };
      mockService.login.mockResolvedValue(result);

      const res = await controller.login({ email: 'test@test.com', password: 'pass123' });

      expect(res.accessToken).toBe('token');
    });

    it('should throw RpcException on invalid credentials', async () => {
      mockService.login.mockRejectedValue(new UnauthorizedException());

      await expect(controller.login({ email: 'bad@test.com', password: 'wrong' }))
        .rejects.toThrow(RpcException);
    });
  });

  describe('getProfile', () => {
    it('should return profile', async () => {
      mockService.getProfile.mockResolvedValue({ id: '1', email: 'test@test.com' });

      const res = await controller.getProfile({ userId: '1' });

      expect(res.email).toBe('test@test.com');
    });
  });
});
