import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { ImagesService } from '../../../portfolio-service/src/images/images.service';

describe('UploadController (Gateway)', () => {
  let controller: UploadController;
  let imagesService: jest.Mocked<ImagesService>;

  const mockImagesService = {
    upload: jest.fn(),
    findByProject: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: ImagesService, useValue: mockImagesService }],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    imagesService = module.get(ImagesService);
    jest.clearAllMocks();
  });

  it('upload should send image to service', async () => {
    mockImagesService.upload.mockResolvedValue({ id: '1', url: 'https://cdn.example.com/img.png', type: 'mockup' });
    const file = { originalname: 'test.png', buffer: Buffer.from('x'), mimetype: 'image/png' };

    const result = await controller.upload('proj-1', 'mockup', file);

    expect(result.url).toContain('example.com');
    expect(imagesService.upload).toHaveBeenCalledWith({
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
    mockImagesService.findByProject.mockResolvedValue({ data: [] });
    const result = await controller.findByProject('proj-1');
    expect(result.data).toEqual([]);
  });

  it('remove', async () => {
    mockImagesService.remove.mockResolvedValue(undefined);
    const result = await controller.remove('1');
    expect(result).toBeUndefined();
  });
});
