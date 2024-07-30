import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { UserInfoSchema } from 'src/schemas/user-info.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseConfigService } from 'src/dynamoose-config.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

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
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '5m' }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [AuthService, DynamooseConfigService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
