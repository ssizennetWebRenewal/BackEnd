import { ApiProperty, OmitType, PickType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator";

export class UserDto {
    @ApiProperty({
        description: "사용자의 id",
        example: "hogun222",
    })
    @IsString()
    @IsNotEmpty()
    id: string = "hogun222";

    @ApiProperty({
        description: "사용자의 이름",
        example: "홍길동",
    })
    @IsString()
    @IsNotEmpty()
    name: string = "홍길동";

    @ApiProperty({
        description: "사용자의 비밀번호",
        example: "strongPassword123!@",
        minLength: 4,
    })
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string = "strongPassword123!@";

    @ApiProperty({
        description: "승인 여부",
        example: false
    })
    @IsBoolean()
    @IsNotEmpty()
    approval: boolean = false;

    @ApiProperty({
        description: "소속 부서",
        example: "방송기술부"
    })
    @IsString()
    @IsNotEmpty()
    department: string = "방송기술부";

    @ApiProperty({
        description: "직위",
        example: ["방송기술부", "영상제팀"]
    })
    @IsArray()
    @IsString()
    @IsNotEmpty()
    responsibility: string[] = ["방송기술부", "영상제팀"];

    @ApiProperty({
        description: "전화번호",
        example: "010-1234-1234"
    })
    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string = "010-1234-1234";

    @ApiProperty({
        description: "이메일",
        example: "user@email.com"
    })
    @IsEmail()
    @IsNotEmpty()
    email: string = "user@email.com";

    @ApiProperty({
        description: "사용자의 생일",
        example: "2024/08/16"
    })
    @IsString()
    @IsNotEmpty()
    birthday: string = "2024/08/16";

    @ApiProperty({
        description: "사용자의 코멘트",
        example: "국군은 국가의 안전보장과 국토방위의 신성한 의무를 수행함을 사명으로 하며, 그 정치적 중립성은 준수된다."
    })
    @IsString()
    @IsNotEmpty()
    comments: string = "국군은 국가의 안전보장과 국토방위의 신성한 의무를 수행함을 사명으로 하며, 그 정치적 중립성은 준수된다.";
    
    @ApiProperty({
        description: "생성 날짜",
        example: "2024-08-15T10:00:00Z",
    })
    @Type(() => Date)
    @IsNotEmpty()
    createdAt: Date = new Date("2024-08-15T10:00:00Z");

    @ApiProperty({
        description: "수정 날짜",
        example: "2024-08-16T10:00:00Z",
    })
    @Type(() => Date)
    @IsNotEmpty()
    updatedAt: Date = new Date("2024-08-16T10:00:00Z");
}

export class CreateUserDto extends OmitType(UserDto, ["responsibility", "createdAt", "updatedAt", "approval"] as const) {}

export class LoginUserDto extends PickType(UserDto, ["id", "password"] as const) {}
