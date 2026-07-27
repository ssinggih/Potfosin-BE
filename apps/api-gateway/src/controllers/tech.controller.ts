import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipAuth } from '../middleware/auth.middleware';
import { CachePolicy } from '@common/decorators/cache-policy.decorator';
import { TechsService } from '../../../portfolio-service/src/techs/techs.service';

@ApiTags('Techs')
@Controller('techs')
export class TechController {
  private readonly logger = new Logger(TechController.name);

  constructor(
    private readonly techsService: TechsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tech' })
  async create(@Body() dto: Record<string, any>) {
    return this.techsService.create(dto as any);
  }

  @Get()
  @SkipAuth()
  @CachePolicy({ maxAge: 10, scope: 'public' })
  @ApiOperation({ summary: 'Get all techs (public)' })
  async findAll() {
    return this.techsService.findAll();
  }

  @Get(':id')
  @SkipAuth()
  @CachePolicy({ maxAge: 10, scope: 'public' })
  @ApiOperation({ summary: 'Get tech by ID' })
  async findOne(@Param('id') id: string) {
    return this.techsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tech by ID' })
  async update(@Param('id') id: string, @Body() dto: Record<string, any>) {
    return this.techsService.update(id, dto as any);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tech by ID' })
  async remove(@Param('id') id: string) {
    return this.techsService.remove(id);
  }
}
