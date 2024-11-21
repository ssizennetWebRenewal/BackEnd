import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { VideoService } from './video.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { Roles, RolesGuard } from 'src/guards/roles.guard';
import { ApproveVideoDto, CreateVideoDto, GetVideoDto, UpdateVideoDto, VideoResponseDto } from './dto/video.dto';
import { CustomRequest } from './interface/video.interface';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Video')
@Controller('video')
export class VideoController {
    constructor(
        private videoService: VideoService
    ) {}

    @Get('details')
    @ApiOperation({summary: '영상 정보 조회', description: '유튜브 영상의 정보를 조회한다.'})
    async getVideoDetails(@Query('url') url: string) {
        const videoDetails = await this.videoService.getVideoInfo(url);
        return {
            title: videoDetails.snippet.title,
            uploadDate: videoDetails.snippet.publishedAt,
            thumbnail: videoDetails.snippet.thumbnails.high.url,
            caption: videoDetails.snippet.description,
        };
    }

    @ApiBearerAuth('access')
    @Post('')
    @ApiOperation({summary: '영상 등록', description: '영상을 등록한다.'})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('사용자')
    async regVideo(@Body() createVideoDto: CreateVideoDto, @Req() req: CustomRequest) {
        return this.videoService.regVideo(createVideoDto, req.user);
    }

    @ApiBearerAuth('access')
    @Patch('/:id')
    @ApiOperation({summary: '영상 수정', description: '영상을 수정한다.'})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('사용자', '영상관리자')
    async updateVideo(
        @Param('id') id: string,
        @Body() updateVideoDto: UpdateVideoDto,
        @Req() req: CustomRequest
    ): Promise<VideoResponseDto> {
        return this.videoService.updateVideo(id, updateVideoDto, req.user);
    }

    @ApiBearerAuth('access')
    @Post('approve/:id')
    @ApiOperation({summary: '영상 승인', description: '영상을 승인한다.'})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('영상관리자')
    async approveVideo(@Param('id') id: string, @Body() approveVideoDto: ApproveVideoDto, @Req() req: CustomRequest) {
        return this.videoService.approveVideo(id, approveVideoDto, req.user);
    }
    
    @Get('')
    @ApiOperation({summary: '영상 목록 조회', description: '영상 목록을 조회한다.'})
    async getVideo(@Query() getVideoDto: GetVideoDto) {
        return this.videoService.getVideo(getVideoDto);
    }

    @Get('/:id')
    @ApiOperation({summary: '영상 조회', description: '영상을 조회한다.'})
    async findOne(@Param('id') id: string) {
        return this.videoService.findOne(id);
    }

    @ApiBearerAuth('access')
    @Delete('/:id')
    @ApiOperation({summary: '영상 삭제', description: '영상을 삭제한다.'})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('사용자', '영상관리자')
    async deleteVideo(@Param('id') id: string,@Req() req: CustomRequest) {
        return this.videoService.deleteVideo(id, req.user);
    }
}
