import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { AuthController } from './auth.controller';

describe('AuthController (Gateway)', () => {
  let controller: AuthController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = { send: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: 'PORTFOLIO_SERVICE', useValue: mockClient }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    client = module.get('PORTFOLIO_SERVICE');
    jest.clearAllMocks();
  });

  it('register', async () => {
    mockClient.send.mockReturnValue(of({ user: { id: '1' }, accessToken: 'token' }));
    const result = await controller.register({ email: 'a@b.com', name: 'A', password: 'pass' });
    expect(result.accessToken).toBe('token');
    expect(client.send).toHaveBeenCalledWith('auth.register', { email: 'a@b.com', name: 'A', password: 'pass' });
  });

  it('login', async () => {
    mockClient.send.mockReturnValue(of({ user: { id: '1' }, accessToken: 'token' }));
    const result = await controller.login({ email: 'a@b.com', password: 'pass' });
    expect(result.accessToken).toBe('token');
    expect(client.send).toHaveBeenCalledWith('auth.login', { email: 'a@b.com', password: 'pass' });
  });

  it('getProfile', async () => {
    mockClient.send.mockReturnValue(of({ id: '1', email: 'a@b.com' }));
    const req = { user: { sub: '1' } } as any;
    const result = await controller.getProfile(req);
    expect(result.email).toBe('a@b.com');
    expect(client.send).toHaveBeenCalledWith('auth.profile', { userId: '1' });
  });
});
