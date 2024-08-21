import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard, Roles } from 'src/guards/roles.guard';
import { CreatePostDto, UpdatePostDto } from './dto/posts.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/comments.dto';

@Controller('post')
export class PostController {
    constructor(
        private readonly postService: PostService
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('사용자', '게시판관리자')
    @Put()
    async createPost(@Body() createPostDto: CreatePostDto, @Req() req: CustomRequest) {
        return this.postService.createPost(createPostDto, req.user);
    }

    @Get()
    async getPosts(@Query('page') page: string, @Query('count') count: string) {
        const pageNum: number = parseInt(page);
        const countNum: number = parseInt(count);
        return this.postService.getPosts(pageNum, countNum);
    }

    @Get(':id')
    async getPost(@Param('id') id: string) {
        return this.postService.getPost(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('사용자', '게시판관리자')
    @Patch(':id')
    async updatePost(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Req() req: CustomRequest) {
        return this.postService.updatePost(id, updatePostDto, req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('사용자', '게시판관리자')
    @Delete(':id')
    async deletePost(@Param('id') id: string, @Req() req: CustomRequest) {
        return this.postService.deletePost(id, req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('사용자', '게시판관리자')
    @Put('comment')
    async createComment(@Body() createCommentDto: CreateCommentDto, @Req() req: CustomRequest) {
        return this.postService.createComment(createCommentDto, req.user);
    }

    @Get('comment/:noticeId')
    async getComments(@Param('noticeId') noticeId: string) {
        return this.postService.getComments(noticeId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('사용자', '게시판관리자')
    @Patch('comment/:id')
    async updateComment(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Req() req: CustomRequest) {
        return this.postService.updateComment(id, updateCommentDto, req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('사용자', '게시판관리자')
    @Delete('comment/:id')
    async deleteComment(@Param('id') id: string, @Req() req: CustomRequest) {
        return this.postService.deleteComment(id, req.user);
    }
}
