import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto/posts.dto';
import { InjectModel, ObjectType } from 'nestjs-dynamoose';
import { ArticleSchema } from 'src/model/schemas/Article.schema';
import { model } from 'dynamoose';
import { CommentsSchema } from 'src/model/schemas/Comments.schema';
import { v4 as uuidv4 } from 'uuid';
import { CreateCommentDto, UpdateCommentDto } from './dto/comments.dto';
import { AppService } from 'src/app.service';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  constructor(
    @InjectModel('Article')
    private readonly postModel = model('Article', ArticleSchema),
    @InjectModel('Comments')
    private readonly commentModel = model('Comments', CommentsSchema),
    private readonly appService: AppService,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    user: any,
    files?: Express.Multer.File[],
  ): Promise<any> {
    const filePaths: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const uploadedFileUrl = await this.appService.uploadFile(file);
        filePaths.push(uploadedFileUrl);
      }
    }

    const newPost = new this.postModel({
      id: uuidv4(),
      topCategory: createPostDto.topCategory,
      subCategory: createPostDto.subCategory,
      title: createPostDto.title,
      body: createPostDto.body,
      filePaths: filePaths,
      youtubePath: createPostDto.youtubePath,
      registrantId: user.id,
      registrantName: user.name,
      downloadCount: 0,
      constTrue: 1,
    });

    await newPost.save();
    this.logger.log(`게시글 생성: ${newPost.id}`);
    return newPost;
  }

  async getPosts(
    page: number,
    count: number,
    topCategory?: string,
  ): Promise<any[]> {
    let items: any[] = [];
    let lastEvaluatedKey: ObjectType | undefined = undefined;

    for (let i = 0; i <= page; i++) {
      const query = this.postModel
        .query('constTrue')
        .eq(1)
        .using('DateIndex')
        .limit(count)
        .sort('descending');

      if (topCategory) {
        query.where('topCategory').eq(topCategory);
      }

      if (lastEvaluatedKey) {
        query.startAt(lastEvaluatedKey);
      }
      const result: any = await query.exec();
      lastEvaluatedKey = result.lastKey;
      if (i === page) {
        items = result;
      }
    }
    return items;
  }

  async getPost(id: string): Promise<any> {
    const post = await this.postModel
      .query('id')
      .eq(id)
      .exec()
      .then((res) => res[0]);
    if (!post) {
      throw new HttpException('게시글을 찾을 수 없습니다.', 404);
    }
    return post;
  }

  async updatePost(
    id: string,
    updatePostDto: UpdatePostDto,
    user: any,
  ): Promise<any> {
    const post = await this.postModel
      .query('id')
      .eq(id)
      .exec()
      .then((res) => res[0]);
    if (!post) {
      throw new HttpException('게시글을 찾을 수 없습니다.', 404);
    }

    if (
      !(
        user.authority.includes('게시판관리자') ||
        (user.authority.includes('사용자') && post.registrantId === user.id)
      )
    ) {
      throw new HttpException(
        '본인이 작성한 게시글만 수정할 수 있습니다.',
        403,
      );
    }

    Object.assign(post, updatePostDto);
    post.updatedAt = new Date().toISOString();
    await post.save();
    this.logger.log(`게시글 수정: ${post.id}`);
    return post;
  }

  async addFiles(
    id: string,
    files: Express.Multer.File[],
    user: any,
  ): Promise<any> {
    const post = await this.postModel
      .query('id')
      .eq(id)
      .exec()
      .then((res) => res[0]);
    if (!post) {
      throw new HttpException('게시글을 찾을 수 없습니다.', 404);
    }

    if (
      !(
        user.authority.includes('게시판관리자') ||
        (user.authority.includes('사용자') && post.registrantId === user.id)
      )
    ) {
      throw new HttpException('작성자만 파일을 추가할 수 있습니다.', 403);
    }

    const filePaths = post.filePaths || [];
    for (const file of files) {
      const uploadedFileUrl = await this.appService.uploadFile(file);
      filePaths.push(uploadedFileUrl);
    }

    post.filePaths = filePaths;
    post.updatedAt = new Date().toISOString();
    await post.save();
    return post;
  }

  async removeFiles(
    id: string,
    filesToRemove: string[],
    user: any,
  ): Promise<any> {
    const post = await this.postModel
      .query('id')
      .eq(id)
      .exec()
      .then((res) => res[0]);
    if (!post) {
      throw new HttpException('게시글을 찾을 수 없습니다.', 404);
    }

    if (
      !(
        user.authority.includes('게시판관리자') ||
        (user.authority.includes('사용자') && post.registrantId === user.id)
      )
    ) {
      throw new HttpException('작성자만 파일을 제거할 수 있습니다.', 403);
    }

    // 파일 삭제
    post.filePaths = post.filePaths.filter((filePath: string) => {
      const shouldDelete = filesToRemove.includes(filePath);
      if (shouldDelete) {
        const fileKey = filePath.split('/').pop();
        if (fileKey) {
          this.appService.deleteFile(fileKey);
        }
      }
      return !shouldDelete;
    });

    post.updatedAt = new Date().toISOString();
    await post.save();
    return post;
  }

  async deletePost(id: string, user: any): Promise<void> {
    const post = await this.postModel
      .query('id')
      .eq(id)
      .exec()
      .then((res) => res[0]);
    if (!post) {
      throw new HttpException('게시글을 찾을 수 없습니다.', 404);
    }

    if (
      !(
        user.authority.includes('게시판관리자') ||
        (user.authority.includes('사용자') && post.registrantId === user.id)
      )
    ) {
      throw new HttpException(
        '본인이 작성한 게시글만 삭제할 수 있습니다.',
        403,
      );
    }

    if (post.filePaths && post.filePaths.length > 0) {
      for (const filePath of post.filePaths) {
        const fileKey = filePath.split('/').pop(); // 파일 키 추출
        await this.appService.deleteFile(fileKey);
      }
    }

    const comments = await this.commentModel.scan({ noticeId: id }).exec();
    for (const comment of comments) {
      await this.commentModel.delete(comment.id);
    }

    await this.postModel.delete(id);
  }

  async createComment(
    createCommentDto: CreateCommentDto,
    user: any,
  ): Promise<any> {
    const newComment = new this.commentModel({
      id: uuidv4(),
      noticeId: createCommentDto.noticeId,
      body: createCommentDto.body,
      userId: user.id,
      userName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await newComment.save();
    return newComment;
  }

  async getComments(noticeId: string): Promise<any[]> {
    return this.commentModel
      .query('noticeId')
      .eq(noticeId)
      .using('NoticeIdCreatedAtIndex')
      .sort('ascending')
      .exec();
  }

  async updateComment(
    id: string,
    updateCommentDto: UpdateCommentDto,
    user: any,
  ): Promise<any> {
    const comment = await this.commentModel
      .query('id')
      .eq(id)
      .exec()
      .then((res) => res[0]);
    if (!comment) {
      throw new HttpException('댓글을 찾을 수 없습니다.', 404);
    }

    if (
      !(
        user.authority.includes('게시판관리자') ||
        (user.authority.includes('사용자') && comment.user_id === user.id)
      )
    ) {
      throw new HttpException('본인이 작성한 댓글만 수정할 수 있습니다.', 403);
    }

    Object.assign(comment, updateCommentDto);
    comment.updatedAt = new Date().toISOString();
    await comment.save();
    return comment;
  }

  async deleteComment(id: string, user: any): Promise<void> {
    const comment = await this.commentModel
      .query('id')
      .eq(id)
      .exec()
      .then((res) => res[0]);
    if (!comment) {
      throw new HttpException('댓글을 찾을 수 없습니다.', 404);
    }

    if (
      !(
        user.authority.includes('게시판관리자') ||
        (user.authority.includes('사용자') && comment.user_id === user.id)
      )
    ) {
      throw new HttpException('본인이 작성한 댓글만 삭제할 수 있습니다.', 403);
    }

    await this.commentModel.delete(id);
  }
}
