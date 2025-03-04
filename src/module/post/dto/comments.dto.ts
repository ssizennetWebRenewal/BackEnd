import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: '댓글이 달린 게시글 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  noticeId: string = '';

  @ApiProperty({ description: '댓글 내용', example: '좋은 글 감사합니다.' })
  @IsString()
  @IsNotEmpty()
  body: string = '';


  @ApiProperty({ description: '답글', example: "590089eb-216a-4eab-aac5-7e63a8731787", required: false, nullable: true })
  @IsString()
  @IsUUID()
  replyId?: string;
}

export class UpdateCommentDto extends PickType(CreateCommentDto, [
  'body',
] as const) {}
