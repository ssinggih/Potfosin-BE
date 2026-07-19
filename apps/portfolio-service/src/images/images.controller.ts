import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ImagesService } from './images.service';

@Controller()
export class ImagesController {
  private readonly logger = new Logger(ImagesController.name);

  constructor(private readonly imagesService: ImagesService) {}

  @MessagePattern('images.upload')
  async upload(@Payload() payload: { projectId: string; fileName: string; fileBuffer: string; encoding?: string; mimeType: string; type: string }) {
    try {
      return await this.imagesService.upload(payload);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 400 });
    }
  }

  @MessagePattern('images.findByProject')
  async findByProject(@Payload() payload: { projectId: string }) {
    try {
      return await this.imagesService.findByProject(payload.projectId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('images.remove')
  async remove(@Payload() payload: { id: string }) {
    try {
      return await this.imagesService.remove(payload.id);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 404 });
    }
  }
}
