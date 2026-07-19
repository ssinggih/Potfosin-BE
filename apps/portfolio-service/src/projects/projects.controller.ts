import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, ProjectFilterDto } from './dto/projects.dto';

@Controller()
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(private readonly projectsService: ProjectsService) {}

  @MessagePattern('projects.create')
  async create(@Payload() dto: CreateProjectDto) {
    try {
      return await this.projectsService.create(dto);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 400 });
    }
  }

  @MessagePattern('projects.findAll')
  async findAll(@Payload() filter: ProjectFilterDto) {
    try {
      return await this.projectsService.findAll(filter);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('projects.findOne')
  async findOne(@Payload() payload: { id: string }) {
    try {
      return await this.projectsService.findOne(payload.id);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 404 });
    }
  }

  @MessagePattern('projects.update')
  async update(@Payload() payload: { id: string; data: UpdateProjectDto }) {
    try {
      return await this.projectsService.update(payload.id, payload.data);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 400 });
    }
  }

  @MessagePattern('projects.remove')
  async remove(@Payload() payload: { id: string }) {
    try {
      return await this.projectsService.remove(payload.id);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 404 });
    }
  }
}
