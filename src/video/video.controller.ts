import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { VideoService } from './video.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { Roles, RolesGuard } from 'src/guards/roles.guard';
import { ApproveVideoDto, CreateVideoDto, GetVideoDto, UpdateVideoDto, VideoResponseDto } from './dto/video.dto';
import { CustomRequest } from './interface/video.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Video')
@Controller('video')
export class VideoController {
    constructor(
        private videoService: VideoService
    ) {}

    @Get('video-details')
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
    @Put('regVideo')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('사용자')
    async regVideo(@Body() createVideoDto: CreateVideoDto, @Req() req: CustomRequest) {
        return this.videoService.regVideo(createVideoDto, req.user);
    }

    @ApiBearerAuth('access')
    @Patch('updateVideo/:id')
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
    @Patch('approveVideo/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('영상관리자')
    async approveVideo(@Param('id') id: string, @Body() approveVideoDto: ApproveVideoDto, @Req() req: CustomRequest) {
        return this.videoService.approveVideo(id, approveVideoDto, req.user);
    }

    @Get('getVideo')
    async getVideo(@Query() getVideoDto: GetVideoDto) {
        return this.videoService.getVideo(getVideoDto);
    }

    @Get('video/:id')
    async findOne(@Param('id') id: string) {
        return this.videoService.findOne(id);
    }

    @ApiBearerAuth('access')
    @Delete('deleteVideo/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('사용자', '영상관리자')
    async deleteVideo(@Param('id') id: string,@Req() req: CustomRequest) {
        return this.videoService.deleteVideo(id, req.user);
    }
}
