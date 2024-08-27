import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { UsersSchema } from 'src/schemas/Users.schema';
import { JwtModule } from '@nestjs/jwt';
import { SettingsSchema } from 'src/schemas/Settings.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { AppModule } from 'src/app.module';

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
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret_key',
      signOptions: { expiresIn: '30m' },
    }),
    forwardRef(() => AppModule)
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
