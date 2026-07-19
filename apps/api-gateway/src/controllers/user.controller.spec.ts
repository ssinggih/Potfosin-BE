import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { UserController } from './user.controller';

describe('UserController (Gateway)', () => {
  let controller: UserController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = { send: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: 'PORTFOLIO_SERVICE', useValue: mockClient }],
    }).compile();

    controller = module.get<UserController>(UserController);
    client = module.get('PORTFOLIO_SERVICE');
    jest.clearAllMocks();
  });

  it('create', async () => {
    mockClient.send.mockReturnValue(of({ id: '1', email: 'a@b.com' }));
    const result = await controller.create({ email: 'a@b.com', name: 'A', password: 'pass' });
    expect(result.id).toBe('1');
  });

  it('findAll', async () => {
    mockClient.send.mockReturnValue(of({ data: [], meta: {} }));
    const result = await controller.findAll(1, 10);
    expect(result.data).toEqual([]);
  });

  it('findOne', async () => {
    mockClient.send.mockReturnValue(of({ id: '1' }));
    const result = await controller.findOne('1');
    expect(result.id).toBe('1');
  });

  it('update', async () => {
    mockClient.send.mockReturnValue(of({ id: '1', name: 'Updated' }));
    const result = await controller.update('1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('remove', async () => {
    mockClient.send.mockReturnValue(of(undefined));
    const result = await controller.remove('1');
    expect(result).toBeUndefined();
  });
});
