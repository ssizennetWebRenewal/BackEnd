import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { model } from 'dynamoose';
import { InjectModel } from 'nestjs-dynamoose';
import { CreateUserDto, LoginUserDto } from 'src/auth/dto/user.dto';
import { UsersSchema } from 'src/schemas/Users.schema';
import * as bcrypt from 'bcrypt';
import * as dynamoose from 'dynamoose';
import { SettingsSchema } from 'src/schemas/Settings.schema';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('Users')
        private readonly UsersModel = model('Users', UsersSchema),
        @InjectModel('Settings')
        private readonly SettingsModel = model('Settings', SettingsSchema),
        private readonly jwtService: JwtService
    ) {}
    
    async signup(data: CreateUserDto) {
        let isPasswordStrong: boolean = this.checkPasswordStrength(data.password.toString());
        if (!isPasswordStrong) {
            throw new HttpException('비밀번호가 강력하지 않습니다. ', 400);
        }
        let user = (await this.UsersModel.query('id').eq(data.id).exec())[0];
        if (user) {
            throw new HttpException('해당 id를 가진 사용자가 이미 존재합니다. ', 409);
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
}
