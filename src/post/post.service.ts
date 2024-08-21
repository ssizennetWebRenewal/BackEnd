import { HttpException, Injectable } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto/posts.dto';
import { InjectModel, ObjectType } from 'nestjs-dynamoose';
import { PostsSchema } from 'src/schemas/Posts.schema';
import { model } from 'dynamoose';
import { CommentsSchema } from 'src/schemas/Comments.schema';
import { v4 as uuidv4 } from 'uuid';
import { CreateCommentDto, UpdateCommentDto } from './dto/comments.dto';

@Injectable()
export class PostService {
    constructor(
        @InjectModel('Posts')
        private readonly postModel = model('Posts', PostsSchema),
        @InjectModel('Comments')
        private readonly commentModel = model('Comments', CommentsSchema)
    ) {}
    

    async createPost(createPostDto: CreatePostDto, user: any): Promise<any> {
        const newPost = new this.postModel({
            id: uuidv4(),
            topCategory: createPostDto.topCategory,
            subCategory: createPostDto.subCategory,
            title: createPostDto.title,
            body: createPostDto.body,
            filePaths: createPostDto.filePaths,
            registrantId: user.id,
            registrantName: user.name,
            downloadCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            constTrue: 1,
        });
    
        await newPost.save();
        return newPost;
    }

    async getPosts(page: number, count: number): Promise<any[]> {
        let items: any[] = [];
        let lastEvaluatedKey: ObjectType | undefined = undefined;
        
        for (let i = 0; i <= page; i++) {
          const query = this.postModel.query("constTrue")
              .eq(1)
              .using("DateIndex")
              .limit(count)
              .sort("descending");
  
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
        const post = await this.postModel.get(id);
        if (!post) {
          throw new HttpException('게시글을 찾을 수 없습니다.', 404);
        }
        return post;
    }

    async updatePost(id: string, updatePostDto: UpdatePostDto, user: any): Promise<any> {
        const post = await this.postModel.get(id);
        if (!post) {
          throw new HttpException('게시글을 찾을 수 없습니다.', 404);
        }
        
        if (!(user.authority.includes('게시판관리자') || (user.authority.includes('사용자') && post.registrantId === user.id))) {
          throw new HttpException('본인이 작성한 게시글만 수정할 수 있습니다.', 403);
        }
        
        Object.assign(post, updatePostDto);
        post.updatedAt = Date.now();
        await post.save();
        return post;
    }

    async deletePost(id: string, user: any): Promise<void> {
      const post = await this.postModel.get(id);
      if (!post) {
        throw new HttpException('게시글을 찾을 수 없습니다.', 404);
      }
      
      if (!(user.authority.includes('게시판관리자') || (user.authority.includes('사용자') && post.registrantId === user.id))) {
        throw new HttpException('본인이 작성한 게시글만 삭제할 수 있습니다.', 403);
      }
  
      await this.postModel.delete(id);
    }

    async createComment(createCommentDto: CreateCommentDto, user: any): Promise<any> {
        const newComment = new this.commentModel({
          id: uuidv4(),
          noticeId: createCommentDto.noticeId,
          body: createCommentDto.body,
          userId: user.id,
          userName: user.name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
    
        await newComment.save();
        return newComment;
    }

    async getComments(noticeId: string): Promise<any[]> {
        return this.commentModel.query("noticeId")
            .eq(noticeId)
            .using("NoticeIdCreatedAtIndex")
            .sort("ascending")
            .exec();
    }

    async updateComment(id: string, updateCommentDto: UpdateCommentDto, user: any): Promise<any> {
        const comment = await this.commentModel.get(id);
        if (!comment) {
          throw new HttpException('댓글을 찾을 수 없습니다.', 404);
        }
        
        if (!(user.authority.includes('게시판관리자') || (user.authority.includes('사용자') && comment.user_id === user.id))) {
          throw new HttpException('본인이 작성한 댓글만 수정할 수 있습니다.', 403);
        }
    
        Object.assign(comment, updateCommentDto);
        comment.updatedAt = Date.now();
        await comment.save();
        return comment;
    }

    async deleteComment(id: string, user: any): Promise<void> {
        const comment = await this.commentModel.get(id);
        if (!comment) {
          throw new HttpException('댓글을 찾을 수 없습니다.', 404);
        }
        
        if (!(user.authority.includes('게시판관리자') || (user.authority.includes('사용자') && comment.user_id === user.id))) {
          throw new HttpException('본인이 작성한 댓글만 삭제할 수 있습니다.', 403);
        }
    
        await this.commentModel.delete(id);
    }
}