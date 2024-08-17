import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { UsersSchema } from 'src/schemas/Users.schema';
import { JwtModule } from '@nestjs/jwt';
import { SettingsSchema } from 'src/schemas/Settings.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    DynamooseModule.forFeature([
      { name: "Users", schema: UsersSchema },
      { name: "Settings", schema: SettingsSchema }
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret_key', // 환경 변수에서 가져오거나 기본값 설정
      signOptions: { expiresIn: '1h' }, // 토큰 만료 시간 설정
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
