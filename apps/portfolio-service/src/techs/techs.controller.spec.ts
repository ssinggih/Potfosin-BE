import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { NotFoundException } from '@nestjs/common';
import { TechsController } from './techs.controller';
import { TechsService } from './techs.service';

describe('TechsController', () => {
  let controller: TechsController;
  let service: jest.Mocked<TechsService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechsController],
      providers: [{ provide: TechsService, useValue: mockService }],
    }).compile();

    controller = module.get<TechsController>(TechsController);
    service = module.get(TechsService);
    jest.clearAllMocks();
  });

  it('create', async () => {
    mockService.create.mockResolvedValue({ id: '1', name: 'React' });
    const result = await controller.create({ name: 'React', slug: 'react' });
    expect(result.name).toBe('React');
  });

  it('findAll', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    const result = await controller.findAll();
    expect(result.data).toEqual([]);
  });

  it('findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne({ id: '1' });
    expect(result.id).toBe('1');
  });

  it('findOne throws RpcException', async () => {
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
