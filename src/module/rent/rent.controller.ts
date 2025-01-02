import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RentService } from './rent.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { Roles, RolesGuard } from 'src/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApplyRentDto, ApproveRentDto, UpdateRentDto } from './dto/rent.dto';
import { Response } from 'express';

@ApiTags('Rent')
@Controller('rent')
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('사용자')
  @Post('')
  @ApiOperation({
    summary: '대여 신청',
    description: '대여 신청을 처리합니다.',
  })
  @ApiBody({ type: ApplyRentDto })
  @ApiResponse({ status: 201, description: '대여 신청 완료' })
  async applyRent(
    @Body() applyRentDto: ApplyRentDto,
    @Req() req: CustomRequest,
    @Res() res: Response,
  ) {
    const newRent = await this.rentService.applyRent(
      applyRentDto,
      req.user.id,
      req.user.name,
    );
    return res.status(201).json({
      message: '대여 신청 완료',
      rent: newRent,
    });
  }

  @Get('')
  @ApiOperation({
    summary: '대여 목록 조회',
    description: '특정 대여 목록을 최신순으로 반환합니다.',
  })
  @ApiResponse({ status: 200, description: '대여 목록 반환' })
  @ApiResponse({ status: 204, description: '대여 정보가 없습니다.' })
  async getRent(
    @Query('page') page: string,
    @Query('count') count: string,
    @Res() res: Response,
  ) {
    const pageNumber = parseInt(page, 10) || 0;
    const countNumber = parseInt(count, 10) || 10;

    const rents = await this.rentService.getRent(pageNumber, countNumber);
    return res.status(200).json(rents);
  }

  @Get('monthRent')
  @ApiOperation({
    summary: '특정 달의 대여 정보 조회',
    description: '특정 달에 있는 대여 정보를 반환합니다.',
  })
  @ApiResponse({ status: 200, description: '대여 정보 반환' })
  @ApiResponse({
    status: 204,
    description: '선택한 달에 대여 정보가 없습니다.',
  })
  async monthRented(
    @Query('year') year: number,
    @Query('month') month: number,
    @Res() res: Response,
  ) {
    const rents = await this.rentService.monthRented(year, month);
    return res.status(200).json(rents);
  }

  @Get(':id')
  @ApiOperation({
    summary: '대여 정보 조회',
    description: '특정 대여 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '대여 ID (UUID 형식)' })
  @ApiResponse({ status: 200, description: '대여 정보 반환' })
  @ApiResponse({ status: 404, description: '대여 정보를 찾을 수 없습니다.' })
  async getRentById(@Param('id') id: string, @Res() res: Response) {
    const rent = await this.rentService.getRentById(id);
    return res.status(200).json(rent);
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('사용자', '장비관리자')
  @Patch('/:id')
  @ApiOperation({
    summary: '대여 수정',
    description: '대여 정보를 수정합니다.',
  })
  @ApiBody({ type: UpdateRentDto })
  @ApiResponse({ status: 200, description: '대여 수정 완료' })
  async updateRent(
    @Param('id') id: string,
    @Body() updateRentDto: UpdateRentDto,
    @Res() res: Response,
    @Req() req: CustomRequest,
  ) {
    await this.rentService.updateRent(id, updateRentDto, req.user);
    return res.status(200).json({ message: '대여 수정 완료' });
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('장비관리자')
  @Post('approveRent')
  @ApiOperation({
    summary: '대여 승인',
    description: '신청된 대여를 승인합니다.',
  })
  @ApiBody({ type: ApproveRentDto })
  @ApiResponse({ status: 200, description: '대여 승인 완료' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async approveRent(
    @Body() approveRentDto: ApproveRentDto,
    @Res() res: Response,
  ) {
    await this.rentService.approveRent(approveRentDto);
    return res.status(200).json({ message: '대여 승인 완료' });
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('사용자', '장비관리자')
  @Delete('/:id')
  @ApiOperation({
    summary: '대여 삭제',
    description: '대여 정보를 삭제합니다.',
  })
  @ApiResponse({ status: 200, description: '대여 삭제 완료' })
  async deleteRent(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: CustomRequest,
  ) {
    await this.rentService.deleteRent(id, req.user);
    return res.status(200).json({ message: '대여 삭제 완료' });
  }
}
