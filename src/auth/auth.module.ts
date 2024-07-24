import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { UserInfoSchema } from 'src/schemas/user-info.schema';
import { SessionsSchema } from 'src/schemas/sessions.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseConfigService } from 'src/dynamoose-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DynamooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DynamooseConfigService,
      inject: [ConfigService],
    }),
    DynamooseModule.forFeature([
      { name: 'UserInfo', schema: UserInfoSchema },
      { name: 'Sessions', schema: SessionsSchema }
    ])
  ],
  providers: [AuthService, DynamooseConfigService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
