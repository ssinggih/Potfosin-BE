import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { NotFoundException } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TeamType } from './dto/projects.dto';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: jest.Mocked<ProjectsService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [{ provide: ProjectsService, useValue: mockService }],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get(ProjectsService);
    jest.clearAllMocks();
  });

  it('create', async () => {
    mockService.create.mockResolvedValue({ id: '1', name: 'Project' });
    const result = await controller.create({ name: 'Project', description: 'Desc', teamType: TeamType.SOLO });
    expect(result!.name).toBe('Project');
  });

  it('findAll', async () => {
    mockService.findAll.mockResolvedValue({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
    const result = await controller.findAll({});
    expect(result.data).toEqual([]);
  });

  it('findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne({ id: '1' });
    expect(result!.id).toBe('1');
  });

  it('findOne throws RpcException', async () => {
    mockService.findOne.mockRejectedValue(new NotFoundException());
    await expect(controller.findOne({ id: 'bad' })).rejects.toThrow(RpcException);
  });

  it('update', async () => {
    mockService.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await controller.update({ id: '1', data: { name: 'Updated' } });
    expect(result!.name).toBe('Updated');
  });

  it('remove', async () => {
    mockService.remove.mockResolvedValue({ deleted: true, id: '1' });
    const result = await controller.remove({ id: '1' });
    expect(result.deleted).toBe(true);
  });
});
