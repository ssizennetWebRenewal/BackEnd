import { Body, Controller, HttpCode, Post, Put, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from 'src/auth/dto/user.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Put('signup')
    @ApiOperation({summary: '회원가입', description: 'User 정보를 생성한다.'})
    @ApiBody({type: CreateUserDto})
    async signup(@Body() body: CreateUserDto, @Res() res: Response) {
        await this.authService.signup(body);
        return res.status(201).json({
            message: "created"
        });
    }

    @Post('signin')
    @ApiOperation({summary: '로그인', description: 'id와 pw를 통해 jwt를 반환한다'})
    @ApiBody({type: LoginUserDto})
    async signin(@Body() body: LoginUserDto, @Res() res: Response) {
        let token = await this.authService.signin(body);
        return res.status(200).json(token);
    }
}
