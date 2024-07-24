import { ApiProperty } from "@nestjs/swagger";

export class UserInfo {
  @ApiProperty({example: 'user_id', description: '사용자의 아이디'})
  user_id: string;
  @ApiProperty({example: 'examplePW1!', description: '사용자의 비밀번호'})
  password: string;
  @ApiProperty({example: '방송기술부', description: '사용자의 부서'})
  department: string;
  @ApiProperty({example: 24, description: '사용자의 기수'})
  user_generation: number;
  @ApiProperty({example: '2021-08-31T00:00:00.000Z', description: '생성 시간'})
  created_at: Date;
  @ApiProperty({example: '2021-08-31T00:00:00.000Z', description: '수정 시간'})
  modified_at: Date;
}

export class UserInfoKey {
  @ApiProperty({example: 'user_id', description: '사용자의 아이디'})
    user_id: string;
    @ApiProperty({example: 24, description: '사용자의 기수'})
    user_generation: number;
  }

export class UserSignUp {
  @ApiProperty({example: 'user_id', description: '사용자의 아이디'})
  user_id: string;
  @ApiProperty({example: 24, description: '사용자의 기수'})
  user_generation: number;
  @ApiProperty({example: 'examplePW1!', description: '사용자의 비밀번호'})
  password: string;
  @ApiProperty({example: '방송기술부', description: '사용자의 부서'})
  department: string;
}

export class UserSignIn {
  @ApiProperty({example: 'user_id', description: '사용자의 아이디'})
  user_id: string;
  @ApiProperty({example: 'examplePW1!', description: '사용자의 비밀번호'})
  password: string;
}
