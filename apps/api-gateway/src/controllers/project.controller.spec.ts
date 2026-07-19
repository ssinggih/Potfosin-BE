import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectsService } from '../../../portfolio-service/src/projects/projects.service';

describe('ProjectController (Gateway)', () => {
  let controller: ProjectController;
  let projectsService: jest.Mocked<ProjectsService>;

  const mockProjectsService = {
    create: jest.fn().mockResolvedValue(undefined),
    findAll: jest.fn().mockResolvedValue(undefined),
    findOne: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [{ provide: ProjectsService, useValue: mockProjectsService }],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    projectsService = module.get(ProjectsService);
    jest.clearAllMocks();
  });

  it('create', async () => {
    mockProjectsService.create.mockResolvedValue({ id: '1', name: 'Project' });
    const result = await controller.create({ name: 'Project', description: 'Desc', teamType: 'solo' });
    expect(result!.name).toBe('Project');
    expect(projectsService.create).toHaveBeenCalledWith({ name: 'Project', description: 'Desc', teamType: 'solo' });
  });

  it('findAll', async () => {
    mockProjectsService.findAll.mockResolvedValue({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
    const result = await controller.findAll(1, 10, 'complete', undefined);
    expect(result!.data).toEqual([]);
    expect(projectsService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10, status: 'complete', techId: undefined });
  });

  it('findOne', async () => {
    mockProjectsService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1');
    expect(result!.id).toBe('1');
  });

  it('update', async () => {
    mockProjectsService.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await controller.update('1', { name: 'Updated' });
    expect(result!.name).toBe('Updated');
  });

  it('partialUpdate', async () => {
    mockProjectsService.update.mockResolvedValue({ id: '1', status: 'complete' });
    const result = await controller.partialUpdate('1', { status: 'complete' });
    expect(result!.status).toBe('complete');
  });

  it('remove', async () => {
    mockProjectsService.remove.mockResolvedValue(undefined);
    const result = await controller.remove('1');
    expect(result).toBeUndefined();
    expect(projectsService.remove).toHaveBeenCalledWith('1');
  });
});
