import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';
import { UploadController } from './upload.controller';

describe('UploadController (Gateway)', () => {
  let controller: UploadController;
  let client: jest.Mocked<ClientProxy>;

  const mockClient = { send: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: 'PORTFOLIO_SERVICE', useValue: mockClient }],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    client = module.get('PORTFOLIO_SERVICE');
    jest.clearAllMocks();
  });

  it('upload should send image to microservice', async () => {
    mockClient.send.mockReturnValue(of({ id: '1', url: 'https://cdn.example.com/img.png', type: 'mockup' }));
    const file = { originalname: 'test.png', buffer: Buffer.from('x'), mimetype: 'image/png' };

    const result = await controller.upload('proj-1', 'mockup', file);

    expect(result.url).toContain('example.com');
    expect(client.send).toHaveBeenCalledWith('images.upload', {
      projectId: 'proj-1', fileName: 'test.png', fileBuffer: Buffer.from('x').toString('base64'), encoding: 'base64', mimeType: 'image/png', type: 'mockup',
    });
  });

  it('upload should reject invalid type', async () => {
    const file = { originalname: 'test.png', buffer: Buffer.from('x'), mimetype: 'image/png' };

    await expect(controller.upload('proj-1', 'invalid', file)).rejects.toThrow(BadRequestException);
  });

  it('upload should reject missing file', async () => {
    await expect(controller.upload('proj-1', 'mockup', null as any)).rejects.toThrow(BadRequestException);
  });

  it('findByProject', async () => {
    mockClient.send.mockReturnValue(of({ data: [] }));
    const result = await controller.findByProject('proj-1');
    expect(result.data).toEqual([]);
  });

  it('remove', async () => {
    mockClient.send.mockReturnValue(of(undefined));
    const result = await controller.remove('1');
    expect(result).toBeUndefined();
  });
});
