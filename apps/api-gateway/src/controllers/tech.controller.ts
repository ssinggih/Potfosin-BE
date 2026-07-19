import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SkipAuth } from '../middleware/auth.middleware';

@ApiTags('Techs')
@Controller('techs')
export class TechController {
  private readonly logger = new Logger(TechController.name);

  constructor(
    @Inject('PORTFOLIO_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tech' })
  async create(@Body() dto: Record<string, any>) {
    return firstValueFrom(this.client.send('techs.create', dto));
  }

  @Get()
  @SkipAuth()
  @ApiOperation({ summary: 'Get all techs (public)' })
  async findAll() {
    return firstValueFrom(this.client.send('techs.findAll', {}));
  }

  @Get(':id')
  @SkipAuth()
  @ApiOperation({ summary: 'Get tech by ID' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.client.send('techs.findOne', { id }));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tech by ID' })
  async update(@Param('id') id: string, @Body() dto: Record<string, any>) {
    return firstValueFrom(
      this.client.send('techs.update', { id, data: dto }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tech by ID' })
  async remove(@Param('id') id: string) {
    return firstValueFrom(this.client.send('techs.remove', { id }));
  }
}
