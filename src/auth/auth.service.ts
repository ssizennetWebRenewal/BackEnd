import { HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { model } from 'dynamoose';
import * as dynamoose from 'dynamoose';
import { InjectModel } from 'nestjs-dynamoose';
import { UserSignUp } from 'src/interfaces/user-info.interface';
import { UserInfoSchema } from 'src/schemas/user-info.schema';
import { LoginDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('UserInfo')
        private readonly UserInfoModel = model('UserInfo', UserInfoSchema),
        private readonly jwtService: JwtService,
    ) {}
    
    async signin(loginData: LoginDto) {
        let user = (await this.UserInfoModel.query('user_id').eq(loginData.user_id).exec())[0];
        if (!user) {
            throw new HttpException('User not found', 404);
        }
        let isPasswordMatch = await bcrypt.compare(loginData.password, user.password);
        if (!isPasswordMatch) {
            throw new HttpException('Password not match', 404);
        }
        const acessPayload = {
            type: 'access',
            user_id: user.user_id,
            user_generation: user.user_generation,
        };
        const refreshPayload = {
            type: 'refresh',
            user_id: user.user_id,
            user_generation: user.user_generation,
        };
        return {
            acess: this.jwtService.sign(acessPayload, { expiresIn: '5m' }),
            refresh: this.jwtService.sign(refreshPayload, { expiresIn: '2h' }),
        }
    }

    async signup(signupData: UserSignUp) {
        let isPasswordStrong = this.checkPasswordStrength(signupData);
        if (!isPasswordStrong) {
            throw new HttpException('Password is not strong', 400);
        }
        const user = (await this.UserInfoModel.query('user_id').eq(signupData.user_id).exec())[0];
        if (user) {
            throw new HttpException('User already exists', 409);
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(signupData.password, salt);
        let newUser = new this.UserInfoModel({
            user_id: signupData.user_id,
            user_generation: signupData.user_generation,
            password: hashedPassword,
            department: signupData.department,
            approval: false,
        });

        return await dynamoose.transaction([
            this.UserInfoModel.transaction.create(newUser)
        ]);
    }

    checkPasswordStrength(signupData: UserSignUp): boolean {
        let min_password = 8;
        let max_password = 16;
        if (signupData.password.length < min_password || signupData.password.length > max_password) {
            return false;
        }
        let hasUppercase = /[A-Z]/.test(signupData.password);
        let hasLowercase = /[a-z]/.test(signupData.password);
        let hasNumber = /[0-9]/.test(signupData.password);
        let hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(signupData.password);
        let characterTypes = [hasUppercase, hasLowercase, hasNumber, hasSpecial];
        let numberOfTypes = characterTypes.filter(Boolean).length;
        if (numberOfTypes < 3) {
            return false;
        }
        return true;
    }

    async hashing(signupData: UserSignUp){
        signupData.password = await bcrypt.hash(signupData.password, 14);
        return signupData;
    }
}
