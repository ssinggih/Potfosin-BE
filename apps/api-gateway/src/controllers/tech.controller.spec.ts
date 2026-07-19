import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { TechController } from './tech.controller';

describe('TechController (Gateway)', () => {
  let controller: TechController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = { send: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechController],
      providers: [{ provide: 'PORTFOLIO_SERVICE', useValue: mockClient }],
    }).compile();

    controller = module.get<TechController>(TechController);
    client = module.get('PORTFOLIO_SERVICE');
    jest.clearAllMocks();
  });

  it('create', async () => {
    mockClient.send.mockReturnValue(of({ id: '1', name: 'React' }));
    const result = await controller.create({ name: 'React', slug: 'react' });
    expect(result.name).toBe('React');
  });

  it('findAll', async () => {
    mockClient.send.mockReturnValue(of({ data: [], total: 0 }));
    const result = await controller.findAll();
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
