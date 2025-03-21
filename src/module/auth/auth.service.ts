import { HttpException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { model } from 'dynamoose';
import { InjectModel } from 'nestjs-dynamoose';
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
  idDto,
  refreshTokenDto,
} from 'src/module/auth/dto/user.dto';
import { UsersSchema } from 'src/model/schemas/Users.schema';
import * as bcrypt from 'bcrypt';
import * as dynamoose from 'dynamoose';
import { SettingsSchema } from 'src/model/schemas/Settings.schema';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AppService } from 'src/app.service';
import { RefreshTokenSchema } from 'src/model/schemas/RefreshToken.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel('Users')
    private readonly UsersModel = model('Users', UsersSchema),
    @InjectModel('Settings')
    private readonly SettingsModel = model('Settings', SettingsSchema),
    @InjectModel('RefreshToken')
    private readonly RefreshTokenModel = model(
      'RefreshToken',
      RefreshTokenSchema,
    ),
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly appService: AppService,
  ) {}

  async idCheck(data: idDto) {
    let user = (await this.UsersModel.query('id').eq(data.id).exec())[0];
    if (!user) {
      return {"message": `Id available`};
    }
    throw new HttpException(`User already exist, ${data.id}`, 409);
  }

  async signup(data: CreateUserDto) {
    const existingUser = await this.UsersModel.query('id').eq(data.id).exec();
    if (existingUser.length > 0) {
      throw new HttpException('해당 ID를 가진 사용자가 이미 존재합니다.', 409);
    }

    const isPasswordStrong: boolean = this.checkPasswordStrength(
      data.password.toString(),
    );
    if (!isPasswordStrong) {
      throw new HttpException('비밀번호가 강력하지 않습니다. ', 400);
    }

    const salt = await bcrypt.genSalt();
    data.password = await bcrypt.hash(data.password, salt);

    const newUser = new this.UsersModel(data);

    console.log(newUser);

    return await dynamoose.transaction([
      this.UsersModel.transaction.create(newUser),
    ]);
  }

  async signin(data: LoginUserDto): Promise<{}> {
    const user = (await this.UsersModel.query('id').eq(data.id).exec())[0];
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const isPasswordMatch = await bcrypt.compare(data.password, user.password);
    if (!isPasswordMatch) {
      throw new HttpException('Password not match', 404);
    }

    let authorities: string[] = [];
    for (const responsibility of user.responsibility) {
      const authority = (
        await this.SettingsModel.query('categoryType')
          .eq('authorityList')
          .where('category')
          .eq(responsibility)
          .exec()
      )[0]?.items;
      const items: string[] = authority.map(
        (element: { item: string; description?: string }) => element.item,
      );
      authorities = authorities.concat(items);
    }

    const accessPayload = {
      type: 'access',
      authority: authorities,
      id: user.id,
      name: user.name,
    };
    const refreshPayload = {
      id: user.id,
      type: 'refresh',
    };

    const access = this.jwtService.sign(accessPayload, { expiresIn: '30m' });
    const refresh = this.jwtService.sign(refreshPayload, { expiresIn: '3d' });

    await this.RefreshTokenModel.update({
      id: user.id,
      refresh: refresh,
      authority: authorities,
      name: user.name,
      issuedAt: Math.floor(Date.now() / 1000),
      expiresAt: Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60,
    });

    this.logger.log(`User ${user.id} logged in`);
    return {
      access: access,
      refresh: refresh,
    };
  }

  private checkPasswordStrength(password: string): boolean {
    const min_password = 8;
    const max_password = 256;
    if (password.length < min_password || password.length > max_password) {
      return false;
    }
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    const characterTypes = [hasUppercase, hasLowercase, hasNumber, hasSpecial];
    const numberOfTypes = characterTypes.filter(Boolean).length;
    if (numberOfTypes < 3) {
      return false;
    }
    return true;
  }

  async refresh(refreshToken: refreshTokenDto): Promise<{}> {
    const decodeToken = await this.jwtService.verify(refreshToken.refresh, {
      secret: this.configService.get('SECRET_KEY'),
    });
    const id = decodeToken.id;

    const storedToken = (
      await this.RefreshTokenModel.query('id').eq(id).exec()
    )[0];
    if (!storedToken) {
      throw new HttpException('Invalid refresh token', 401);
    } else if (decodeToken.refresh != refreshToken.refresh) {
      this.logger.warn(`Invalid refresh token tried`);
      await this.RefreshTokenModel.delete({ id: storedToken.id });
      throw new HttpException('The attempt to issue a token is invalid', 401);
    }

    const accessPayload = {
      type: 'access',
      authority: storedToken.authority,
      name: storedToken.name,
      id: storedToken.id,
    };
    const refreshPayload = {
      type: 'refresh',
      id: storedToken.id,
    };
    const access = this.jwtService.sign(accessPayload, { expiresIn: '30m' });
    const refresh = this.jwtService.sign(refreshPayload, { expiresIn: '3d' });
    const sto = await this.RefreshTokenModel.update({
      id: storedToken.id,
      token: refresh,
      authority: storedToken.authority,
      name: storedToken.name,
      issuedAt: Math.floor(Date.now() / 1000),
      expiresAt: Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60,
    });

    this.logger.log(`User ${id} refreshed token`);
    return {
      access: access,
      refresh: refresh,
    };
  }

  async logout(req: Request): Promise<void> {
    if (!req.headers['authorization']) {
      throw new HttpException('Invalid token', 401);
    }
    const token: string = req.headers['authorization'].replace('Bearer ', '');
    const decodeToken = this.jwtService.verify(token, {
      secret: this.configService.get('SECRET_KEY'),
    });
    const userId = decodeToken.id;

    this.logger.log(`User ${userId} logged out`);
    await this.RefreshTokenModel.delete({ id: userId });
  }

  async profile(req: Request) {
    if (!req.headers['authorization']) {
      throw new HttpException('Invalid token', 401);
    }
    const token: string = req.headers['authorization'].replace('Bearer ', '');
    const decodeToken = this.jwtService.verify(token, {
      secret: this.configService.get('SECRET_KEY'),
    });
    const user = (
      await this.UsersModel.query('id').eq(decodeToken.id).exec()
    )[0];
    delete user.password;
    return user;
  }

  async updateProfile(user: any, updateData: UpdateUserDto): Promise<{}> {
    const updateUser = await this.UsersModel.update(
      { id: user.id },
      updateData,
    );
    return updateUser;
  }

  async changePassword(
    user: any,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const legacy = (await this.UsersModel.query('id').eq(user.id).exec())[0];
    if (!legacy) {
      throw new HttpException('사용자가 존재하지 않음', 404);
    }

    const isPasswordMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      legacy.password,
    );
    if (!isPasswordMatch) {
      throw new HttpException('비밀번호가 일치하지 않음. ', 401);
    }

    const isPasswordStrong: boolean = this.checkPasswordStrength(
      changePasswordDto.changedPassword.toString(),
    );
    if (!isPasswordStrong) {
      throw new HttpException('비밀번호가 강력하지 않습니다. ', 400);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(
      changePasswordDto.changedPassword,
      salt,
    );

    await this.UsersModel.update({ id: user.id }, { password: hashedPassword });
  }

  async uploadProfileImage(
    user: any,
    file: Express.Multer.File,
  ): Promise<string> {
    // 기존 프로필 이미지가 있으면 삭제
    const dbUser = (await this.UsersModel.query('id').eq(user.id).exec())[0];
    if (dbUser.photo) {
      const photoKey = dbUser.photo.split('/').pop();
      await this.appService.deleteFile(photoKey);
    }

    // 새로운 이미지를 업로드
    const imageUrl = await this.appService.uploadFile(file);

    // 사용자의 photo 필드를 업데이트
    await this.UsersModel.update({ id: user.id }, { photo: imageUrl });

    return imageUrl;
  }

  async deleteProfileImage(user: any): Promise<void> {
    const dbUser = (await this.UsersModel.query('id').eq(user.id).exec())[0];

    if (dbUser.photo) {
      const photoKey = dbUser.photo.split('/').pop();
      await this.appService.deleteFile(photoKey);
      await this.UsersModel.update({ id: user.id }, { photo: null });
    } else {
      throw new HttpException('프로필 이미지가 존재하지 않습니다.', 404);
    }
  }

  async deleteAccount(user: any): Promise<void> {
    const dbUser = (await this.UsersModel.query('id').eq(user.id).exec())[0];

    if (!dbUser) {
      throw new HttpException('사용자가 존재하지 않습니다.', 404);
    }

    if (dbUser.photo) {
      const photoKey = dbUser.photo.split('/').pop();
      await this.appService.deleteFile(photoKey);
    }

    this.logger.log(`User ${user.id} deleted account`);
    await this.UsersModel.delete({ id: user.id });
  }
}
