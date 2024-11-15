import { Module } from '@nestjs/common';
import { ManageController } from './manage.controller';
import { ManageService } from './manage.service';
import { ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { JwtModule } from '@nestjs/jwt';
import { SettingsSchema } from 'src/model/schemas/Settings.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    DynamooseModule.forFeature([
      { name: "Settings", schema: SettingsSchema }
    ]),
    JwtModule,
  ],
  controllers: [ManageController],
  providers: [ManageService],
  exports: [ManageService]
})
export class ManageModule {}
