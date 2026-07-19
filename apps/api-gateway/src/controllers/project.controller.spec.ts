import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { ProjectController } from './project.controller';

describe('ProjectController (Gateway)', () => {
  let controller: ProjectController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = { send: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [{ provide: 'PORTFOLIO_SERVICE', useValue: mockClient }],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    client = module.get('PORTFOLIO_SERVICE');
    jest.clearAllMocks();
  });

  it('create', async () => {
    mockClient.send.mockReturnValue(of({ id: '1', name: 'Project' }));
    const result = await controller.create({ name: 'Project', description: 'Desc', teamType: 'solo' });
    expect(result.name).toBe('Project');
    expect(client.send).toHaveBeenCalledWith('projects.create', { name: 'Project', description: 'Desc', teamType: 'solo' });
  });

  it('findAll', async () => {
    mockClient.send.mockReturnValue(of({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }));
    const result = await controller.findAll(1, 10, 'complete', undefined);
    expect(result.data).toEqual([]);
    expect(client.send).toHaveBeenCalledWith('projects.findAll', { page: 1, limit: 10, status: 'complete', techId: undefined });
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

  it('partialUpdate', async () => {
    mockClient.send.mockReturnValue(of({ id: '1', status: 'complete' }));
    const result = await controller.partialUpdate('1', { status: 'complete' });
    expect(result.status).toBe('complete');
  });

  it('remove', async () => {
    mockClient.send.mockReturnValue(of(undefined));
    const result = await controller.remove('1');
    expect(result).toBeUndefined();
    expect(client.send).toHaveBeenCalledWith('projects.remove', { id: '1' });
  });
});
