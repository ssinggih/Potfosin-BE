import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
    jest.clearAllMocks();
  });

  it('create', async () => {
    mockService.create.mockResolvedValue({ id: '1' });
    const result = await controller.create({ email: 'a@b.com', name: 'A', password: 'pass' });
    expect(result).toEqual({ id: '1' });
  });

  it('findAll', async () => {
    mockService.findAll.mockResolvedValue({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
    const result = await controller.findAll({});
    expect(result.data).toEqual([]);
  });

  it('findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne({ id: '1' });
    expect(result.id).toBe('1');
  });

  it('findOne throws RpcException on not found', async () => {
    mockService.findOne.mockRejectedValue(new NotFoundException());
    await expect(controller.findOne({ id: 'bad' })).rejects.toThrow(RpcException);
  });

  it('update', async () => {
    mockService.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await controller.update({ id: '1', data: { name: 'Updated' } });
    expect(result.name).toBe('Updated');
  });

  it('remove', async () => {
    mockService.remove.mockResolvedValue({ deleted: true, id: '1' });
    const result = await controller.remove({ id: '1' });
    expect(result.deleted).toBe(true);
  });
});
