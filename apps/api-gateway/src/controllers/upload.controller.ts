import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Logger,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { ImagesService } from '../../../portfolio-service/src/images/images.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(
    private readonly imagesService: ImagesService,
  ) {}

  @Post(':projectId/:type')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload an image (mockup or post) to a project' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req: any, file: any, cb: any) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif|svg\+xml)$/)) {
          cb(new BadRequestException('Only image files allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @Param('projectId') projectId: string,
    @Param('type') type: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!['mockup', 'post'].includes(type)) {
      throw new BadRequestException('Type must be "mockup" or "post"');
    }

    return this.imagesService.upload({
      projectId,
      fileName: file.originalname,
      fileBuffer: file.buffer.toString('base64'),
      encoding: 'base64',
      mimeType: file.mimetype,
      type,
    });
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get all images for a project' })
  async findByProject(@Param('projectId') projectId: string) {
    return this.imagesService.findByProject(projectId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an image' })
  async remove(@Param('id') id: string) {
    return this.imagesService.remove(id);
  }
}
