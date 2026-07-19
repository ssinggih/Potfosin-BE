import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { NotFoundException } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

describe('ImagesController', () => {
  let controller: ImagesController;
  let service: jest.Mocked<ImagesService>;

  const mockService = {
    upload: jest.fn(),
    findByProject: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [{ provide: ImagesService, useValue: mockService }],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
    service = module.get(ImagesService);
    jest.clearAllMocks();
  });

  it('upload', async () => {
    mockService.upload.mockResolvedValue({ id: '1', url: 'https://cdn.example.com/img.png', type: 'mockup' });
    const result = await controller.upload({
      projectId: 'proj-1', fileName: 'test.png', fileBuffer: Buffer.from('x').toString('base64'), encoding: 'base64', mimeType: 'image/png', type: 'mockup',
    });
    expect(result.url).toContain('example.com');
  });

  it('findByProject', async () => {
    mockService.findByProject.mockResolvedValue({ data: [] });
    const result = await controller.findByProject({ projectId: 'proj-1' });
    expect(result.data).toEqual([]);
  });

  it('remove', async () => {
    mockService.remove.mockResolvedValue({ deleted: true, id: '1' });
    const result = await controller.remove({ id: '1' });
    expect(result.deleted).toBe(true);
  });

  it('remove throws RpcException', async () => {
    mockService.remove.mockRejectedValue(new NotFoundException());
    await expect(controller.remove({ id: 'bad' })).rejects.toThrow(RpcException);
  });
});
