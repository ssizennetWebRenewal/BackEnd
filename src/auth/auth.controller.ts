import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { UserSignUp } from 'src/interfaces/user-info.interface';
import { AuthGuard } from '@nestjs/passport';//?????
import { LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('signup')
    @ApiOperation({summary: '회원가입 api', description: 'User 정보를 생성한다.'})
    @ApiBody({type: UserSignUp})
    async signup(@Body() body: UserSignUp) {
        return await this.authService.signup(body);
    }

    @Post('signin')
    async signin(@Body() body: LoginDto) {
        return await this.authService.signin(body);
    }
}
