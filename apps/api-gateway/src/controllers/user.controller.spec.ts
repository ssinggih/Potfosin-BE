import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UsersService } from '../../../portfolio-service/src/users/users.service';

describe('UserController (Gateway)', () => {
  let controller: UserController;
  let usersService: jest.Mocked<UsersService>;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    usersService = module.get(UsersService);
    jest.clearAllMocks();
  });

  it('create', async () => {
    mockUsersService.create.mockResolvedValue({ id: '1', email: 'a@b.com' });
    const result = await controller.create({ email: 'a@b.com', name: 'A', password: 'pass' });
    expect(result.id).toBe('1');
  });

  it('findAll', async () => {
    mockUsersService.findAll.mockResolvedValue({ data: [], meta: {} });
    const result = await controller.findAll(1, 10);
    expect(result.data).toEqual([]);
  });

  it('findOne', async () => {
    mockUsersService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1');
    expect(result.id).toBe('1');
  });

  it('update', async () => {
    mockUsersService.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await controller.update('1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('remove', async () => {
    mockUsersService.remove.mockResolvedValue(undefined);
    const result = await controller.remove('1');
    expect(result).toBeUndefined();
  });
});
