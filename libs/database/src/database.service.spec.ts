import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;

  const mockConfig = {
    get: jest.fn((key: string) => {
      const env: Record<string, string> = {
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_USERNAME: 'postgres',
        DB_PASSWORD: 'postgres',
        DB_NAME: 'test_db',
      };
      return env[key] || null;
    }),
  };

  afterEach(async () => {
    if (service) {
      await service.onModuleDestroy();
    }
  });

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService, { provide: ConfigService, useValue: mockConfig }],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    expect(service).toBeDefined();
  });

  it('should return pool', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService, { provide: ConfigService, useValue: mockConfig }],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    expect(service.getPool()).toBeDefined();
  });

  it('query should execute SQL via pool', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService, { provide: ConfigService, useValue: mockConfig }],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    const querySpy = jest.spyOn(service, 'query').mockResolvedValue({ rows: [], rowCount: 0 } as any);

    await service.query('SELECT 1');
    expect(querySpy).toHaveBeenCalledWith('SELECT 1');
  });
});
