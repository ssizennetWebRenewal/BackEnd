import { HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { model } from 'dynamoose';
import { InjectModel } from 'nestjs-dynamoose';
import { UserSignUp } from 'src/interfaces/user-info.interface';
import { SessionsSchema } from 'src/schemas/sessions.schema';
import { UserInfoSchema } from 'src/schemas/user-info.schema';
import { LoginDto } from './dto/auth.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('UserInfo')
        private readonly UserInfoModel = model('UserInfo', UserInfoSchema),
        @InjectModel('Sessions')
        private readonly SessionsModel = model('Sessions', SessionsSchema)
    ) {}
    
    async signup(signupData: UserSignUp) {
        let user = await this.UserInfoModel.get({ user_id: signupData.user_id, user_generation: signupData.user_generation });
        if (user != null) {
            throw new HttpException('이미 존재하는 아이디입니다.', 400);
        }

        if (await this.checkPasswordStrength(signupData)) {
            signupData = await this.hashing(signupData);
            await this.UserInfoModel.create(signupData);
            return signupData;
        }
        throw new HttpException('부적합한 비밀번호입니다.', 400);
    }
    
    async signin(signinData: LoginDto) {
        let userQueryResult = await this.UserInfoModel.query('user_id').eq(signinData.user_id).exec();
        if (userQueryResult.count === 0 || userQueryResult[0] === undefined) {
            throw new HttpException('존재하지 않는 아이디입니다.', 400);
        }
        const user = userQueryResult[0];
        if (await bcrypt.compare(signinData.password, user.password)) {
            console.log(user.user_id)
            let sessionQueryResult = await this.SessionsModel.query('user_id').eq(user.user_id).exec();
            
            if (sessionQueryResult.count === 0) {
                let session = sessionQueryResult[0];
                console.log(session);
                const now = Math.floor(Date.now() / 1000);
    
                if (session && session.exp > now) {
                    return session;
                }
    
                if (session) {
                    await this.SessionsModel.delete({ session_id: session.session_id });
                }
            }

            let sessionData = {
                session_id: this.generateSessionId(),
                exp: this.lifetimeLatency(),
                user_id: user.user_id
            };
            await this.SessionsModel.create(sessionData);
            return sessionData;
        }

        throw new HttpException('비밀번호가 일치하지 않습니다.', 400);
    }

    async logout(session_id: string) {
        let session = await this.SessionsModel.get({ session_id: session_id });
        if (session != null) {
            await this.SessionsModel.delete({ session_id: session_id });
            return session;
        }
        throw new HttpException('세션을 찾을 수 없습니다.', 400);
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

    generateSessionId() {
        return randomBytes(16).toString('hex');
    }

    lifetimeLatency() {
        return Math.floor((Date.now() + 5 * 60 * 1000) / 1000);//일단 5분으로 설정 (단위 : ms) - 나중에 환경 변수에서 설정해야 함
    }
}
