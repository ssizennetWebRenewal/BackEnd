import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { InjectModel } from 'nestjs-dynamoose';
import { model } from 'dynamoose';
import { SettingsSchema } from './model/schemas/Settings.schema';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectModel('Settings')
    private readonly SettingsModel = model('Users', SettingsSchema),
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  //나중에 막아야함요
  @Post('uploadFile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.appService.uploadFile(file);
    return {
      message: 'File uploaded successfully',
      result,
    };
  }

  //나중에 막아야함요
  @Post('addSettings')
  async addSettings(@Body() data: any, @Res() res: Response) {
    const newSettings = new this.SettingsModel({
      ...data,
    });

    console.log(newSettings);
    console.log('added');
    await newSettings.save();

    return res.status(201).json({});
  }

  //나중에 막아야함요
  @Get('Settings')
  async getSettings() {
    return await this.SettingsModel.scan().exec();
  }
}
