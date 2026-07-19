import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
import { SkipAuth } from '../middleware/auth.middleware';

@ApiTags('Projects')
@Controller('projects')
export class ProjectController {
  private readonly logger = new Logger(ProjectController.name);

  constructor(
    @Inject('PORTFOLIO_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @SkipAuth()
  @ApiOperation({ summary: 'Create a new project' })
  async create(@Body() dto: Record<string, any>) {
    return firstValueFrom(this.client.send('projects.create', dto));
  }

  @Get()
  @SkipAuth()
  @ApiOperation({ summary: 'Get all projects (public)' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('techId') techId?: string,
  ) {
    return firstValueFrom(
      this.client.send('projects.findAll', { page, limit, status, techId }),
    );
  }

  @Get(':id')
  @SkipAuth()
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.client.send('projects.findOne', { id }));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project by ID' })
  async update(@Param('id') id: string, @Body() dto: Record<string, any>) {
    return firstValueFrom(
      this.client.send('projects.update', { id, data: dto }),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partial update project' })
  async partialUpdate(@Param('id') id: string, @Body() dto: Record<string, any>) {
    return firstValueFrom(
      this.client.send('projects.update', { id, data: dto }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete project by ID' })
  async remove(@Param('id') id: string) {
    return firstValueFrom(this.client.send('projects.remove', { id }));
  }
}
