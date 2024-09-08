import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ManageService } from './manage.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { Roles, RolesGuard } from 'src/guards/roles.guard';

@ApiTags('Manage')
@Controller('manage')
export class ManageController {
  constructor(private readonly settingsService: ManageService) {}

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('웹사이트관리자')
  @Post()
  @ApiOperation({ summary: '설정 생성', description: '카테고리 타입과 카테고리에 해당하는 설정을 생성한다.' })
    @ApiBody({ 
      schema: {
          type: 'object',
          properties: {
              categoryType: { type: 'string', description: '카테고리 타입' },
              category: { type: 'string', description: '카테고리 이름' },
              items: { 
                  type: 'array', 
                  items: { 
                      type: 'object',
                      description: '설정 항목들',
                  },
                  description: '설정 항목의 배열'
              },
          }
      }
  })
  async createSetting(
    @Body('categoryType') categoryType: string,
    @Body('category') category: string,
    @Body('items') items: any[],
  ) {
    return this.settingsService.createSetting(categoryType, category, items);
  }
  
  @Get(':categoryType/:category')
  @ApiOperation({ summary: '설정 조회', description: '카테고리 타입과 카테고리에 해당하는 설정을 조회한다.' })
  @ApiParam({ name: 'categoryType', description: '카테고리 타입', type: 'string' })
  @ApiParam({ name: 'category', description: '카테고리 이름', type: 'string' })
  async getSetting(
    @Param('categoryType') categoryType: string,
    @Param('category') category: string,
  ) {
    return this.settingsService.getSetting(categoryType, category);
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('웹사이트관리자')
  @Put(':categoryType/:category')
  @ApiOperation({ summary: '설정 업데이트', description: '카테고리 타입과 카테고리에 해당하는 설정을 업데이트한다.' })
  @ApiParam({ name: 'categoryType', description: '카테고리 타입', type: 'string' })
  @ApiParam({ name: 'category', description: '카테고리 이름', type: 'string' })
  @ApiBody({ 
    schema: {
        type: 'object',
        properties: {
            items: { 
                type: 'array', 
                items: { 
                    type: 'object',
                    description: '업데이트할 설정 항목들',
                },
                description: '업데이트할 설정 항목의 배열'
            },
        }
    }
  })
  async updateSetting(
    @Param('categoryType') categoryType: string,
    @Param('category') category: string,
    @Body('items') items: any[],
  ) {
    return this.settingsService.updateSetting(categoryType, category, items);
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('웹사이트관리자')
  @Delete(':categoryType/:category')
  @ApiOperation({ summary: '설정 삭제', description: '카테고리 타입과 카테고리에 해당하는 설정을 삭제한다.' })
  @ApiParam({ name: 'categoryType', description: '카테고리 타입', type: 'string' })
  @ApiParam({ name: 'category', description: '카테고리 이름', type: 'string' })
  async deleteSetting(
    @Param('categoryType') categoryType: string,
    @Param('category') category: string,
  ) {
    return this.settingsService.deleteSetting(categoryType, category);
  }
}
