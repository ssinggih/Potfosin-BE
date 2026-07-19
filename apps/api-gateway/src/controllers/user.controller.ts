import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@ApiTags('Users')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    @Inject('PORTFOLIO_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  async create(@Body() dto: Record<string, any>) {
    return firstValueFrom(this.client.send('users.create', dto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return firstValueFrom(this.client.send('users.findAll', { page, limit }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.client.send('users.findOne', { id }));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  async update(@Param('id') id: string, @Body() dto: Record<string, any>) {
    return firstValueFrom(this.client.send('users.update', { id, data: dto }));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID' })
  async remove(@Param('id') id: string) {
    return firstValueFrom(this.client.send('users.remove', { id }));
  }
}
