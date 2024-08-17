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
    JwtModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
