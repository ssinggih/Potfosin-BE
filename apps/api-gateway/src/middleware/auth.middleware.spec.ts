import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthMiddleware } from './auth.middleware';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let jwtService: jest.Mocked<JwtService>;

  const mockJwt = { verifyAsync: jest.fn(), sign: jest.fn() };
  const mockConfig = { get: jest.fn().mockReturnValue('secret') };

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = new AuthMiddleware(mockJwt as any, mockConfig as any);
    jwtService = mockJwt as any;
  });

  const mockNext = jest.fn();

  const mockReq = (overrides: any = {}) => ({
    path: '/',
    originalUrl: '/api/v1/test',
    url: '/api/v1/test',
    method: 'GET',
    headers: {},
    ...overrides,
  });

  it('should allow /health via originalUrl', async () => {
    const req = mockReq({ originalUrl: '/api/v1/health', path: '/health', url: '/api/v1/health' });
    await middleware.use(req, {} as any, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should allow /api/v1/auth/login', async () => {
    const req = mockReq({ originalUrl: '/api/v1/auth/login', path: '/', method: 'POST' });
    await middleware.use(req, {} as any, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should allow /api/v1/auth/register', async () => {
    const req = mockReq({ originalUrl: '/api/v1/auth/register', path: '/', method: 'POST' });
    await middleware.use(req, {} as any, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should allow GET /api/v1/projects without token (path=/ in nest middleware)', async () => {
    const req = mockReq({ originalUrl: '/api/v1/projects', path: '/', method: 'GET' });
    await middleware.use(req, {} as any, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should allow GET /api/v1/techs/:id', async () => {
    const req = mockReq({ originalUrl: '/api/v1/techs/some-id', path: '/', method: 'GET' });
    await middleware.use(req, {} as any, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should allow GET /api/v1/uploads/:projectId', async () => {
    const req = mockReq({ originalUrl: '/api/v1/uploads/proj-1', path: '/', method: 'GET' });
    await middleware.use(req, {} as any, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should reject missing auth header on protected routes', async () => {
    const req = mockReq({ originalUrl: '/api/v1/users', method: 'GET' });
    await expect(middleware.use(req, {} as any, mockNext)).rejects.toThrow(UnauthorizedException);
  });

  it('should reject invalid token on protected routes', async () => {
    const req = mockReq({
      originalUrl: '/api/v1/users',
      method: 'GET',
      headers: { authorization: 'Bearer bad-token' },
    });
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

    await expect(middleware.use(req, {} as any, mockNext)).rejects.toThrow(UnauthorizedException);
  });

  it('should set req.user with valid token', async () => {
    const payload = { sub: '1', email: 'test@test.com', role: 'admin' };
    jwtService.verifyAsync.mockResolvedValue(payload);
    const req = mockReq({
      originalUrl: '/api/v1/users',
      method: 'POST',
      headers: { authorization: 'Bearer valid-token' },
    });

    await middleware.use(req, {} as any, mockNext);

    expect((req as any).user).toEqual(payload);
    expect(mockNext).toHaveBeenCalled();
  });
});
