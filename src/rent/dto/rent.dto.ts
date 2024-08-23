import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsString, IsUUID, IsNumber, IsInt } from 'class-validator';

export class RentDto {
  @ApiProperty({ description: '대여 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string = "";

  @ApiProperty({ description: '대여 시작 날짜', example: '2024-08-20T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string = "";

  @ApiProperty({ description: '대여 종료 날짜', example: '2024-08-21T18:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string = "";

  @ApiProperty({ description: '팀 이름', example: '방송기술부' })
  @IsString()
  @IsNotEmpty()
  team: string = "";

  @ApiProperty({ description: '대여 제목', example: '방송 장비 대여' })
  @IsString()
  @IsNotEmpty()
  title: string = "";

  @ApiProperty({ description: '신청자 이름', example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  applicantName: string = "";
  
  @ApiProperty({ description: '신청자 id', example: 'hogun222' })
  @IsString()
  @IsNotEmpty()
  applicantId: string = "";

  @ApiProperty({ description: '대여 승인 상태', example: 0 })
  @IsNumber()
  approved: number = 0;

  @ApiProperty({
    description: '장비 목록',
    type: () => [{
      category: String,
      items: [String],
    }],
    example: [
      {
        category: '카메라',
        items: ['CAM-1', 'CAM-2'],
      },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  equipmentList: Array<{
    category: string;
    items: string[];
  }> = [{category: "", items: [""]}];

  @ApiProperty({
    description: '생성 날짜',
    example: '2024-08-15T10:00:00Z',
  })
  @IsDateString()
  createdAt: Date = new Date();

  @ApiProperty({
    description: '수정 날짜',
    example: '2024-08-16T10:00:00Z',
  })
  @IsDateString()
  updatedAt: Date = new Date();
}

export class ApplyRentDto extends PickType(RentDto, [
    'startDate',
    'endDate',
    'team',
    'title',
    'equipmentList'
  ] as const) {}

export class UpdateRentDto extends PickType(RentDto, [
  'startDate',
  'endDate',
  'team',
  'title',
  'equipmentList'
] as const) {}

export class ApproveRentDto extends PickType(RentDto, ['id'] as const) {
  @ApiProperty({ description: '승인 상태', example: 1 })
  @IsInt()
  approved: number = 0;
}

export class DeleteRentDto extends PickType(RentDto, ['id'] as const) {}