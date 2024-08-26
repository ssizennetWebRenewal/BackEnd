import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ManageService } from './manage.service';

@Controller('manage')
export class ManageController {
    constructor(private readonly settingsService: ManageService) {}

  @Post()
  async createSetting(
    @Body('categoryType') categoryType: string,
    @Body('category') category: string,
    @Body('items') items: any[],
  ) {
    return this.settingsService.createSetting(categoryType, category, items);
  }

  @Get(':categoryType/:category')
  async getSetting(
    @Param('categoryType') categoryType: string,
    @Param('category') category: string,
  ) {
    return this.settingsService.getSetting(categoryType, category);
  }

  @Put(':categoryType/:category')
  async updateSetting(
    @Param('categoryType') categoryType: string,
    @Param('category') category: string,
    @Body('items') items: any[],
  ) {
    return this.settingsService.updateSetting(categoryType, category, items);
  }

  @Delete(':categoryType/:category')
  async deleteSetting(
    @Param('categoryType') categoryType: string,
    @Param('category') category: string,
  ) {
    return this.settingsService.deleteSetting(categoryType, category);
  }
}
