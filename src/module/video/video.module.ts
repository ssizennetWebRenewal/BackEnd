import { Module, forwardRef } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigModule } from '@nestjs/config';
import { VideosSchema } from 'src/model/schemas/Videos.schema';
import { AppModule } from 'src/app.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    DynamooseModule.forFeature([
      { name: "Videos", schema: VideosSchema }
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
    forwardRef(() => AppModule),
  ],
  providers: [VideoService],
  controllers: [VideoController]
})
export class VideoModule {}
