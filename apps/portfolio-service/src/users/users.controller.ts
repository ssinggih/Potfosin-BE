import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.create')
  async create(@Payload() dto: CreateUserDto) {
    try {
      return await this.usersService.create(dto);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 400 });
    }
  }

  @MessagePattern('users.findAll')
  async findAll(@Payload() query: { page?: number; limit?: number }) {
    try {
      return await this.usersService.findAll(query.page, query.limit);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('users.findOne')
  async findOne(@Payload() payload: { id: string }) {
    try {
      return await this.usersService.findOne(payload.id);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 404 });
    }
  }

  @MessagePattern('users.update')
  async update(@Payload() payload: { id: string; data: UpdateUserDto }) {
    try {
      return await this.usersService.update(payload.id, payload.data);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 400 });
    }
  }

  @MessagePattern('users.remove')
  async remove(@Payload() payload: { id: string }) {
    try {
      return await this.usersService.remove(payload.id);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 404 });
    }
  }
}
