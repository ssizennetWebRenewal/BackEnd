import { HttpException, Injectable } from '@nestjs/common';
import { model } from 'dynamoose';
import { InjectModel } from 'nestjs-dynamoose';
import { SettingsSchema } from 'src/schemas/Settings.schema';

@Injectable()
export class ManageService {
    constructor(
        @InjectModel('Settings') private readonly settingsModel = model('Settings', SettingsSchema)
    ) {}

    async createSetting(categoryType: string, category: string, items: any[]): Promise<any> {
        const newSetting = new this.settingsModel({
          categoryType,
          category,
          items,
        });
    
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
        return await setting.save();
      }
    
      async deleteSetting(categoryType: string, category: string): Promise<void> {
        await this.settingsModel.delete({ categoryType, category });
      }
}