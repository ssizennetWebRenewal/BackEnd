import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { model } from 'dynamoose';
import { InjectModel } from 'nestjs-dynamoose';
import { ChangePasswordDto, CreateUserDto, LoginUserDto, UpdateUserDto, refreshTokenDto } from 'src/auth/dto/user.dto';
import { UsersSchema } from 'src/schemas/Users.schema';
import * as bcrypt from 'bcrypt';
import * as dynamoose from 'dynamoose';
import { SettingsSchema } from 'src/schemas/Settings.schema';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AppService } from 'src/app.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('Users')
        private readonly UsersModel = model('Users', UsersSchema),
        @InjectModel('Settings')
        private readonly SettingsModel = model('Settings', SettingsSchema),
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly appService: AppService
    ) {}
    
    async signup(data: CreateUserDto) {
        let user = (await this.UsersModel.query('id').eq(data.id).exec())[0];
        if (user) {
            throw new HttpException('해당 id를 가진 사용자가 이미 존재합니다. ', 409);
        }

        let isPasswordStrong: boolean = this.checkPasswordStrength(data.password.toString());
        if (!isPasswordStrong) {
            throw new HttpException('비밀번호가 강력하지 않습니다. ', 400);
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(data.password, salt);
        let newUser = new this.UsersModel({
            ...data,
            password: hashedPassword,
            responsibility: [],
            approval: true, //나중에 false로 바꿔야 함. 
        })
        
        return await dynamoose.transaction([
            this.UsersModel.transaction.create(newUser)
        ]);
    }

    async signin(data: LoginUserDto): Promise<{}> {
        let user = (await this.UsersModel.query('id').eq(data.id).exec())[0];
        if (!user) {
            throw new HttpException('User not found', 404);
        }
        let isPasswordMatch = await bcrypt.compare(data.password, user.password);
        if (!isPasswordMatch) {
            throw new HttpException('Password not match', 404);
        }

        let authorities: string[] = [];
        for (let responsibility of user.responsibility) {
            let authority = (await this.SettingsModel.query("categoryType").eq("authorityList").where("category").eq(responsibility).exec())[0]?.items;
            let items: string[] = authority.map((element: { item: string, description?: string }) => element.item);
            authorities = authorities.concat(items);
        }
        
        const accessPayload = {
            type: "access",
            authority: authorities,
            id: user.id,
            name: user.name
        }
        const refreshPayload = {
            type: "refresh",
            authority: authorities,
            id: user.id,
            name: user.name
        };
        
        return {
            access: this.jwtService.sign(accessPayload, { expiresIn: "5m" }),
            refresh: this.jwtService.sign(refreshPayload, { expiresIn: "2h" })
        };
    }

    checkPasswordStrength(password: string): boolean {
        let min_password = 8;
        let max_password = 256;
        if (password.length < min_password || password.length > max_password) {
            return false;
        }
        let hasUppercase = /[A-Z]/.test(password);
        let hasLowercase = /[a-z]/.test(password);
        let hasNumber = /[0-9]/.test(password);
        let hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
        let characterTypes = [hasUppercase, hasLowercase, hasNumber, hasSpecial];
        let numberOfTypes = characterTypes.filter(Boolean).length;
        if (numberOfTypes < 3) {
            return false;
        }
        return true;
    }

    async refresh(refreshToken: refreshTokenDto): Promise<{}> {
        const decodeToken = this.jwtService.verify(refreshToken.refresh, {secret: this.configService.get('SECRET_KEY')});
        const id = decodeToken.id;
        let user = (await this.UsersModel.query('id').eq(id).exec())[0];
        if (!user) {
            throw new HttpException('User not found', 404);
        }

        let authorities: string[] = [];
        for (let responsibility of user.responsibility) {
            let authority = (await this.SettingsModel.query("categoryType").eq("authorityList").where("category").eq(responsibility).exec())[0]?.items;
            let items: string[] = authority.map((element: { item: string, description?: string }) => element.item);
            authorities = authorities.concat(items);
        }

        const accessPayload = {
            type: "access",
            authority: authorities,
            id: user.id
        }
        const refreshPayload = {
            type: "refresh",
            authority: authorities,
            id: user.id
        };
        
        return {
            access: this.jwtService.sign(accessPayload, { expiresIn: "5m" }),
            refresh: this.jwtService.sign(refreshPayload, { expiresIn: "2h" })
        };
    }

    async logout(req: Request): Promise<void> {
        if (!req.headers['authorization']) {
            throw new HttpException("Invalid token", 401);
        }
        const token: string = req.headers['authorization'].replace("Bearer ", "");
        const decodeToken = this.jwtService.verify(token, {secret: this.configService.get('SECRET_KEY')});
        const userId = decodeToken.id;
        
        //await this.RefreshTokenModel.delete({ id: userId });
    }
    
    async profile(req: Request) {
        if (!req.headers['authorization']) {
            throw new HttpException("Invalid token", 401);
        }
        let token: string = req.headers['authorization'].replace("Bearer ", "");
        const decodeToken = this.jwtService.verify(token, {secret: this.configService.get('SECRET_KEY')})
        let user = (await this.UsersModel.query('id').eq(decodeToken.id).exec())[0];
        delete user.password;
        return user;
    }

    async updateProfile(user: any, updateData: UpdateUserDto): Promise<{}> {
        const updateUser = await this.UsersModel.update({ id:  user.id }, updateData);
        return updateUser;
    }

    async changePassword(user: any, changePasswordDto: ChangePasswordDto): Promise<void> {
        let legacy = (await this.UsersModel.query('id').eq(user.id).exec())[0];
        if (!legacy) {
            throw new HttpException('사용자가 존재하지 않음', 404);
        }

        let isPasswordMatch = await bcrypt.compare(changePasswordDto.currentPassword, legacy.password);
        if (!isPasswordMatch) {
            throw new HttpException('비밀번호가 일치하지 않음. ', 401);
        }

        let isPasswordStrong: boolean = this.checkPasswordStrength(changePasswordDto.changedPassword.toString());
        if (!isPasswordStrong) {
            throw new HttpException('비밀번호가 강력하지 않습니다. ', 400);
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(changePasswordDto.changedPassword, salt);

        await this.UsersModel.update({ id: user.id }, { password: hashedPassword });
    }

    async uploadProfileImage(user: any, file: Express.Multer.File): Promise<string> {
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

        await this.UsersModel.delete({ id: user.id });
      }
}
