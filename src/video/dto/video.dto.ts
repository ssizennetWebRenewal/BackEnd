import { PartialType } from '@nestjs/swagger';
import { IsString, IsDate, IsUrl, IsUUID, IsInt, IsOptional } from 'class-validator';

export class VideoDto {
  @IsString()
  category: string = "";

  @IsString()
  title: string = "";

  @IsString()
  writer: string = "";

  @IsString()
  uploadDate: string = "";

  @IsUrl()
  thumbnail: string = "";

  @IsUrl()
  link: string = "";

  @IsString()
  caption: string = "";
}

export class CreateVideoDto extends VideoDto {}

export class ApproveVideoDto {
  @IsInt()
  approved: number = 0;
}

export class GetVideoDto {
  @IsInt()
  page: number = 1;

  @IsInt()
  count: number = 10;
}

export class VideoResponseDto extends VideoDto {
  @IsUUID()
  id: string = "";

  @IsDate()
  createdAt: Date = new Date();

  @IsDate()
  updatedAt: Date = new Date();
}

export class UpdateVideoDto extends PartialType(CreateVideoDto) {}