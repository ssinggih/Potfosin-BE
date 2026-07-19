import { IsString, IsEnum, IsUUID } from 'class-validator';

export enum ImageType {
  MOCKUP = 'mockup',
  POST = 'post',
}

export class CreateImageDto {
  @IsUUID('4')
  projectId: string;

  @IsString()
  url: string;

  @IsEnum(ImageType)
  type: ImageType;
}

export class UploadImageResponse {
  id: string;
  url: string;
  type: string;
  projectId: string;
}

export class DeleteImageDto {
  @IsUUID('4')
  id: string;
}
