import { IsString, IsOptional, IsEnum, IsArray, IsUUID, MinLength, IsInt, Min, Max, IsDateString } from 'class-validator';

export enum TeamType {
  SOLO = 'solo',
  TEAM = 'team',
}

export enum ProjectStatus {
  COMPLETE = 'complete',
  PROGRESS = 'progress',
  PAUSED = 'paused',
}

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  description: string;

  @IsEnum(TeamType)
  teamType: TeamType;

  @IsOptional()
  @IsString()
  githubLink?: string;

  @IsOptional()
  @IsString()
  designLink?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  demoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyFeatures?: string[];

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  results?: string;

  @IsOptional()
  @IsString()
  challenges?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  priority?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  techIds?: string[];

  @IsOptional()
  @IsString()
  ownerId?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TeamType)
  teamType?: TeamType;

  @IsOptional()
  @IsString()
  githubLink?: string;

  @IsOptional()
  @IsString()
  designLink?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  demoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyFeatures?: string[];

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  results?: string;

  @IsOptional()
  @IsString()
  challenges?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  priority?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  techIds?: string[];
}

export class ProjectFilterDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsString()
  techId?: string;
}
