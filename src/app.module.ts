import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RentModule } from './rent/rent.module';
import { VideoModule } from './video/video.module';
import { PostModule } from './post/post.module';
import { DynamooseModule } from 'nestjs-dynamoose';
import { DynamooseConfigService } from './dynamoose-config.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ManageModule } from './manage/manage.module';
import { SettingsSchema } from './schemas/Settings.schema';

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
      { name: "Settings", schema: SettingsSchema }
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '5m' }
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    RentModule,
    VideoModule,
    PostModule,
    ManageModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
  exports: [PassportModule, JwtModule, AppService]
})
export class AppModule implements NestModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {}
}
