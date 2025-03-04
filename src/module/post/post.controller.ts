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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard, Roles } from 'src/guards/roles.guard';
import { CreatePostDto, UpdatePostDto } from './dto/posts.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/comments.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Article')
@Controller('article')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('사용자', '게시판관리자')
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req: CustomRequest,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.postService.createPost(createPostDto, req.user, files);
  }

  @Get()
  async getPosts(
    @Query('page') page: string,
    @Query('count') count: string,
    @Query('topCategory') topCategory: string,
  ) {
    const pageNum: number = parseInt(page);
    const countNum: number = parseInt(count);
    return this.postService.getPosts(pageNum, countNum, topCategory);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postService.getPost(id);
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('사용자', '게시판관리자')
  @Patch(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: CustomRequest,
  ) {
    return this.postService.updatePost(id, updatePostDto, req.user);
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('사용자', '게시판관리자')
  @Patch('addFiles/:id')
  @UseInterceptors(FilesInterceptor('files'))
  async addFiles(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: CustomRequest,
  ) {
    return this.postService.addFiles(id, files, req.user);
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('사용자', '게시판관리자')
  @Patch('removeFiles/:id')
  async removeFiles(
    @Param('id') id: string,
    @Body() filesToRemove: string[],
    @Req() req: CustomRequest,
  ) {
    return this.postService.removeFiles(id, filesToRemove, req.user);
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('사용자', '게시판관리자')
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.postService.deletePost(id, req.user);
  }
}

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly postService: PostService) {}

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('사용자', '게시판관리자')
  @Post('')
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: CustomRequest,
  ) {
    return this.postService.createComment(createCommentDto, req.user);
  }

  @Get(':noticeId')
  async getComments(@Param('noticeId') noticeId: string) {
    return this.postService.getComments(noticeId);
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('사용자', '게시판관리자')
  @Patch(':id')
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: CustomRequest,
  ) {
    return this.postService.updateComment(id, updateCommentDto, req.user);
  }

  @ApiBearerAuth('access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('사용자', '게시판관리자')
  @Delete(':id')
  async deleteComment(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.postService.deleteComment(id, req.user);
  }
}
