import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: '게시글의 상위 카테고리', example: '공지사항' })
  @IsString()
  @IsNotEmpty()
  topCategory: string = "";

  @ApiProperty({ description: '게시글의 하위 카테고리', example: '일반' })
  @IsString()
  @IsNotEmpty()
  subCategory: string = "";

  @ApiProperty({ description: '게시글의 제목', example: '중요 공지사항' })
  @IsString()
  @IsNotEmpty()
  title: string = "";

  @ApiProperty({ description: '게시글의 내용', example: '공지사항의 내용' })
  @IsString()
  @IsNotEmpty()
  body: string = "";

  @ApiProperty({ description: '첨부파일 경로', example: 'path/to/file.pdf' })
  @IsString()
  filePaths: string = "";
}

export class UpdatePostDto extends PickType(CreatePostDto, [
  'topCategory',
  'subCategory',
  'title',
  'body',
  'filePaths',
] as const) {}