import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsDate, IsUrl, IsInt } from 'class-validator';

export class VideoDto {
  @ApiProperty({ description: '영상의 카테고리', example: '예능' })
  @IsString()
  category: string = '';

  @ApiProperty({
    description: '영상 제목',
    example:
      '[#별별메이트] 홈술 할 때 보면 1시간 순삭🍺 위에 기름칠 하고 쏘맥 싸악 말면 그곳이 바로 천국이쥬? | #스트리트푸드파이터 #디글',
  })
  @IsString()
  title: string = '';

  @ApiProperty({ description: '작성자', example: '박호건' })
  @IsString()
  writer: string = '';

  @ApiProperty({ description: '업로드 날짜', example: '2021-07-09T12:30:12Z' })
  @IsString()
  uploadDate: string = '';

  @ApiProperty({
    description: '영상 썸네일',
    example: 'https://i.ytimg.com/vi/w__SnKoIZPo/hqdefault.jpg',
  })
  @IsUrl()
  thumbnail: string = '';

  @ApiProperty({
    description: '영상(유튜브) 링크',
    example: 'https://www.youtube.com/watch?v=w__SnKoIZPo',
  })
  @IsUrl()
  link: string = '';

  @ApiProperty({
    description: '영상(유튜브) 캡션',
    example:
      "#스트리트푸드파이터 #디글\n\n당신의 모든 순간을 함께하는 별의 별 메이트, [#별별메이트]\n\n💎백종원의 맛집 지도💎\n00:00 [청두] 마라촨\n05:31 [홍콩] 베이퐁통 게 볶음 & 맛조개 볶음 - 백쌤’s Pick👨‍🍳\n11:42 [홍콩] 뽀짜이판 (홍콩식 솥밥)\n16:07 [하얼빈] 생선찜 - 백쌤’s Pick👨‍🍳\n21:05 [시안] 후루터우 샤오차오 (돼지대창볶음)\n27:29 [우한] 요우먼따샤 (마라가재)\n31:49 [우한] 자자 (모듬 튀김)\n36:55 [우한] 뉴자훠궈 (소 내장 훠궈) - 백쌤’s Pick👨‍🍳\n42:50 [연변] 꼬치구이 - 편집자’s Pick💡\n52:35 [연변] 짝태\n\nLet's giggle, :Diggle!\n방송국놈들이 덕질하는 채널 디글 구독하기!\n:Diggle ☞ https://www.youtube.com/c/디글Diggle",
  })
  @IsString()
  caption: string = '';
}

export class CreateVideoDto extends VideoDto {}

export class ApproveVideoDto {
  @ApiProperty({ description: '승인 여부', example: 1 })
  @IsInt()
  approved: number = 0;
}

export class GetVideoDto {
  @ApiProperty({ description: '페이지', example: 1 })
  @IsInt()
  page: number = 1;

  @ApiProperty({ description: '갯수', example: 10 })
  @IsInt()
  count: number = 10;
}

export class VideoResponseDto extends VideoDto {
  @ApiProperty({
    description: '영상 ID',
    example: 'f7b3b1b0-1b7d-4b3b-8b3b-1b7d4b3b8b3b',
  })
  @IsString()
  id: string = '';

  @ApiProperty({ description: '생성일', example: '2021-07-09T12:30:12Z' })
  @IsString()
  createdAt: string = new Date().toISOString();

  @ApiProperty({ description: '수정일', example: '2021-07-09T12:30:12Z' })
  @IsString()
  updatedAt: string = new Date().toISOString();
}

export class UpdateVideoDto extends PartialType(CreateVideoDto) {}
