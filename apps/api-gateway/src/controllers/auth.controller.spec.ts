import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../../portfolio-service/src/auth/auth.service';

describe('AuthController (Gateway)', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('register', async () => {
    mockAuthService.register.mockResolvedValue({ user: { id: '1' }, accessToken: 'token' });
    const result = await controller.register({ email: 'a@b.com', name: 'A', password: 'pass' });
    expect(result.accessToken).toBe('token');
    expect(authService.register).toHaveBeenCalledWith({ email: 'a@b.com', name: 'A', password: 'pass' });
  });

  it('login', async () => {
    mockAuthService.login.mockResolvedValue({ user: { id: '1' }, accessToken: 'token' });
    const result = await controller.login({ email: 'a@b.com', password: 'pass' });
    expect(result.accessToken).toBe('token');
    expect(authService.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pass' });
  });

  it('getProfile', async () => {
    mockAuthService.getProfile.mockResolvedValue({ id: '1', email: 'a@b.com' });
    const req = { user: { sub: '1' } } as any;
    const result = await controller.getProfile(req);
    expect(result.email).toBe('a@b.com');
    expect(authService.getProfile).toHaveBeenCalledWith('1');
  });
});
