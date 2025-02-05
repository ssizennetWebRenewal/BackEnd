import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
  idDto,
  refreshTokenDto,
} from 'src/module/auth/dto/user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { Roles, RolesGuard } from 'src/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입', description: 'User 정보를 생성한다.' })
  @ApiBody({ type: CreateUserDto })
  async signup(@Body() body: CreateUserDto, @Res() res: Response) {
    await this.authService.signup(body);
    return res.status(201).json({
      message: 'created',
    });
  }

  @Post('signin')
  @ApiOperation({
    summary: '로그인',
    description: 'id와 pw를 통해 jwt를 반환한다',
  })
  @ApiBody({ type: LoginUserDto })
  async signin(@Body() body: LoginUserDto, @Res() res: Response) {
    const token = await this.authService.signin(body);
    return res.status(200).json(token);
  }

  @Post('refresh')
  @ApiOperation({
    summary: '토큰 재발급',
    description: 'refresh jwt로 토큰을 재발급한다. ',
  })
  @ApiBody({ type: refreshTokenDto })
  async refresh(@Body() body: refreshTokenDto, @Res() res: Response) {
    const newToken = await this.authService.refresh(body);
    return res.status(200).json(newToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({
    summary: '로그아웃',
    description: 'DB에 저장된 refresh의 레코드를 삭제합니다. ',
  })
  async signout(@Req() req: Request, @Res() res: Response) {
    await this.authService.logout(req);
    return res.status(200).json();
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('사용자')
  @Get('profile')
  @ApiOperation({
    summary: '프로필 조회',
    description: 'jwt로 사용자의 프로필을 조회한다. ',
  })
  async profile(@Req() req: Request, @Res() res: Response) {
    const profile = await this.authService.profile(req);
    return res.status(200).json(profile);
  }

  @Post('idCheck')
    @ApiOperation({summary: '아이디 중복확인', description: 'id의 중복 여부를 반환한다'})
    @ApiBody({type: idDto})
    async idCheck(@Body() body: idDto, @Res() res: Response) {
        let result = await this.authService.idCheck(body);
        return res.status(200).json(result);
    }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({
    summary: '유저 정보 수정',
    description: '사용자의 프로필 정보를 수정한다.',
  })
  @ApiBody({ type: UpdateUserDto })
  async updateProfile(
    @Body() body: UpdateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const updatedProfile = await this.authService.updateProfile(req.user, body);
    return res.status(200).json(updatedProfile);
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard)
  @Patch('password')
  @ApiOperation({
    summary: '비밀번호 변경',
    description: '사용자의 비밀번호를 변경한다.',
  })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Body() body: ChangePasswordDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.authService.changePassword(req.user, body);
    return res
      .status(200)
      .json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard)
  @Post('profileImage')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '업로드할 파일',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({
    summary: '프로필 이미지 업로드',
    description: '사용자의 프로필 이미지를 업로드한다.',
  })
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const imageUrl = await this.authService.uploadProfileImage(req.user, file);
    return res.status(200).json({
      message: '프로필 이미지가 성공적으로 업로드되었습니다.',
      imageUrl,
    });
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard)
  @Delete('profileImage')
  @ApiOperation({
    summary: '프로필 이미지 삭제',
    description: '사용자의 프로필 이미지를 삭제한다.',
  })
  async deleteProfileImage(@Req() req: Request, @Res() res: Response) {
    await this.authService.deleteProfileImage(req.user);
    return res
      .status(200)
      .json({ message: '프로필 이미지가 성공적으로 삭제되었습니다.' });
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard)
  @Delete('account')
  @ApiOperation({
    summary: '회원 탈퇴',
    description: '사용자의 계정을 삭제합니다.',
  })
  async deleteAccount(@Req() req: Request, @Res() res: Response) {
    await this.authService.deleteAccount(req.user);
    return res
      .status(200)
      .json({ message: '계정이 성공적으로 삭제되었습니다.' });
  }
}
