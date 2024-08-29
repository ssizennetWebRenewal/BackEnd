import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, youtube_v3 } from 'googleapis';
import { ApproveVideoDto, CreateVideoDto, GetVideoDto, UpdateVideoDto, VideoResponseDto } from './dto/video.dto';
import { InjectModel } from 'nestjs-dynamoose';
import { model } from 'dynamoose';
import { VideosSchema } from 'src/schemas/Videos.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VideoService {
  private youtube: youtube_v3.Youtube;
  private readonly logger = new Logger(VideoService.name);
  constructor(
      @InjectModel('Videos')
      private readonly videoModel = model('Videos', VideosSchema),
      private configService: ConfigService,
  ) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.configService.get<string>('GOOGLE_API_KEY'),
    });
  }

  async getVideoInfo(videoUrl: string): Promise<any> {
      const videoId = this.extractVideoId(videoUrl);
      if (!videoId) {
        return new HttpException('Invalid video URL', 400);
      }

      try {
        const response = await this.youtube.videos.list({
          id: [videoId],
          part: ['snippet', 'contentDetails'],
        });
  
        if (!response.data.items || response.data.items.length === 0) {
          throw new Error('Video not found');
        }
  
        return response.data.items[0];
      } catch (error) {
        throw new HttpException("Failed to fetch video details", 500);
      }
  }
  
  private extractVideoId(url: string): string | null {
    if (!url.includes("youtube.com")) {
      return url;
    }
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async regVideo(createVideoDto: CreateVideoDto, user: any): Promise<VideoResponseDto> {
    const video = new this.videoModel({
      ...createVideoDto,
      id: uuidv4(),
      writer: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      approved: 0, // 기본 승인 상태는 미결 (0)
    });

    await video.save();
    this.logger.log(`비디오 등록: ${createVideoDto.title}, ${user.id} (${video.id})`);
    return {
      id: video.id,
      category: video.category,
      title: video.title,
      writer: video.writer,
      uploadDate: video.uploadDate,
      thumbnail: video.thumbnail,
      link: video.link,
      caption: video.caption,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt
    } as VideoResponseDto;
  }

  async updateVideo(id: string, updateVideoDto: UpdateVideoDto, user: any): Promise<VideoResponseDto> {
    const video = await this.videoModel.get(id);
    if (!video) {
      throw new HttpException('해당 비디오를 찾을 수 없습니다.', 404);
    }

    if (!user.authority.includes('영상관리자') || (user.authority.includes('사용자') && video.writer !== user.id)) {
      throw new HttpException('작성자만 이 비디오를 수정할 수 있습니다.', 403);
    }

    Object.assign(video, updateVideoDto);
    video.updatedAt = new Date();

    await video.save();

    this.logger.log(`비디오 수정: ${video.title}, ${user.id} (${video.id})`);
    return {
      id: video.id,
      category: video.category,
      title: video.title,
      writer: video.writer,
      uploadDate: video.uploadDate,
      thumbnail: video.thumbnail,
      link: video.link,
      caption: video.caption,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt
    } as VideoResponseDto;
  }
  
  async approveVideo(id: string, approveVideoDto: ApproveVideoDto, user: any): Promise<VideoResponseDto> {
      const video = await this.videoModel.get(id);
      if (!video) {
        throw new HttpException('해당 비디오를 찾을 수 없습니다.', 404);
      }
      if (!user.authority.includes('영상관리자')) {
        throw new HttpException('권한이 부족합니다.', 403);
      }
  
      video.approved = approveVideoDto.approved;
      video.updatedAt = new Date();
      await video.save();
      return {
        id: video.id,
        category: video.category,
        title: video.title,
        writer: video.writer,
        uploadDate: video.uploadDate,
        thumbnail: video.thumbnail,
        link: video.link,
        caption: video.caption,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt
      } as VideoResponseDto;
    }
  
  async getVideo(getVideoDto: GetVideoDto): Promise<VideoResponseDto[]> {
    const { page, count } = getVideoDto;
    const videos = await this.videoModel.scan().exec();
    return videos.slice((page - 1) * count, page * count).map(video => ({
      id: video.id,
      category: video.category,
      title: video.title,
      writer: video.writer,
      uploadDate: video.uploadDate,
      thumbnail: video.thumbnail,
      link: video.link,
      caption: video.caption,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt
    })) as VideoResponseDto[];
  }

  async findOne(id: string): Promise<VideoResponseDto> {
    const video = await this.videoModel.get(id);
    if (!video) {
      throw new HttpException('해당 비디오를 찾을 수 없습니다.', 404);
    }
    return {
      id: video.id,
      category: video.category,
      title: video.title,
      writer: video.writer,
      uploadDate: video.uploadDate,
      thumbnail: video.thumbnail,
      link: video.link,
      caption: video.caption,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt
    } as VideoResponseDto;
  }

  async deleteVideo(id: string, user: any): Promise<void> {
    const video = await this.videoModel.get(id);
    if (!video) {
      throw new HttpException('해당 비디오를 찾을 수 없습니다.', 404);
    }
    if ((!user.authority.includes('영상관리자')) || (user.authority.includes('사용자') && video.writer !== user.id)) {
      throw new HttpException('작성자만 이 비디오를 삭제할 수 있습니다.', 403);
    }
    await this.videoModel.delete(id);
    this.logger.log(`비디오 삭제: ${video.title}, ${user.id} (${video.id})`);
  }
}
