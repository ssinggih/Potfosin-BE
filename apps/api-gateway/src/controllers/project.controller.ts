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
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipAuth } from '../middleware/auth.middleware';
import { ProjectsService } from '../../../portfolio-service/src/projects/projects.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectController {
  private readonly logger = new Logger(ProjectController.name);

  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @SkipAuth()
  @ApiOperation({ summary: 'Create a new project' })
  async create(@Body() dto: Record<string, any>) {
    return this.projectsService.create(dto as any);
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
    return this.projectsService.findAll({ page, limit, status, techId } as any);
  }

  @Get(':id')
  @SkipAuth()
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project by ID' })
  async update(@Param('id') id: string, @Body() dto: Record<string, any>) {
    return this.projectsService.update(id, dto as any);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partial update project' })
  async partialUpdate(@Param('id') id: string, @Body() dto: Record<string, any>) {
    return this.projectsService.update(id, dto as any);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete project by ID' })
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
