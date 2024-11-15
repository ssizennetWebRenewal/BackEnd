import { HttpException, Injectable, Logger } from '@nestjs/common';
import { model } from 'dynamoose';
import { InjectModel } from 'nestjs-dynamoose';
import { SettingsSchema } from 'src/model/schemas/Settings.schema';

@Injectable()
export class ManageService {
  private readonly logger = new Logger(ManageService.name);
  constructor(
      @InjectModel('Settings') private readonly settingsModel = model('Settings', SettingsSchema),
  ) {}

  async createSetting(categoryType: string, category: string, items: any[]): Promise<any> {
    const newSetting = new this.settingsModel({
      categoryType,
      category,
      items,
    });
    this.logger.log(`Creating setting ${categoryType} ${category}`);
    return await newSetting.save();
  }
  
  async getSetting(categoryType: string, category: string): Promise<any> {
    const setting = await this.settingsModel.get({ categoryType, category });
    if (!setting) {
      throw new HttpException('Setting not found', 404);
    }
    return setting;
  }

  async updateSetting(categoryType: string, category: string, items: any[]): Promise<any> {
    const setting = await this.settingsModel.get({ categoryType, category });
    if (!setting) {
      throw new HttpException('Setting not found', 404);
    }
    setting.items = items;
    this.logger.log(`Updating setting ${categoryType} ${category}`);
    return await setting.save();
  }

  async deleteSetting(categoryType: string, category: string): Promise<void> {
    this.logger.log(`Deleting setting ${categoryType} ${category}`);
    await this.settingsModel.delete({ categoryType, category });
  }
}