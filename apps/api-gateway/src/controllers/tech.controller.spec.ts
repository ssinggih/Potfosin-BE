import { Test, TestingModule } from '@nestjs/testing';
import { TechController } from './tech.controller';
import { TechsService } from '../../../portfolio-service/src/techs/techs.service';

describe('TechController (Gateway)', () => {
  let controller: TechController;
  let techsService: jest.Mocked<TechsService>;

  const mockTechsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechController],
      providers: [{ provide: TechsService, useValue: mockTechsService }],
    }).compile();

    controller = module.get<TechController>(TechController);
    techsService = module.get(TechsService);
    jest.clearAllMocks();
  });

  it('create', async () => {
    mockTechsService.create.mockResolvedValue({ id: '1', name: 'React' });
    const result = await controller.create({ name: 'React', slug: 'react' });
    expect(result.name).toBe('React');
  });

  it('findAll', async () => {
    mockTechsService.findAll.mockResolvedValue({ data: [], total: 0 });
    const result = await controller.findAll();
    expect(result.data).toEqual([]);
  });

  it('findOne', async () => {
    mockTechsService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1');
    expect(result.id).toBe('1');
  });

  it('update', async () => {
    mockTechsService.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await controller.update('1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('remove', async () => {
    mockTechsService.remove.mockResolvedValue(undefined);
    const result = await controller.remove('1');
    expect(result).toBeUndefined();
  });
});
