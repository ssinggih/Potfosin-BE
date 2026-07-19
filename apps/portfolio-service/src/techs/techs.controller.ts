import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { TechsService } from './techs.service';
import { CreateTechDto, UpdateTechDto } from './dto/techs.dto';

@Controller()
export class TechsController {
  private readonly logger = new Logger(TechsController.name);

  constructor(private readonly techsService: TechsService) {}

  @MessagePattern('techs.create')
  async create(@Payload() dto: CreateTechDto) {
    try {
      return await this.techsService.create(dto);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 400 });
    }
  }

  @MessagePattern('techs.findAll')
  async findAll() {
    try {
      return await this.techsService.findAll();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('techs.findOne')
  async findOne(@Payload() payload: { id: string }) {
    try {
      return await this.techsService.findOne(payload.id);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 404 });
    }
  }

  @MessagePattern('techs.update')
  async update(@Payload() payload: { id: string; data: UpdateTechDto }) {
    try {
      return await this.techsService.update(payload.id, payload.data);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 400 });
    }
  }

  @MessagePattern('techs.remove')
  async remove(@Payload() payload: { id: string }) {
    try {
      return await this.techsService.remove(payload.id);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 404 });
    }
  }
}
