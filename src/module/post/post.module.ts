import { Module, forwardRef } from '@nestjs/common';
import { CommentController, PostController } from './post.controller';
import { PostService } from './post.service';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseConfigService } from 'src/dynamoose-config.service';
import { ArticleSchema } from 'src/model/schemas/Article.schema';
import { CommentsSchema } from 'src/model/schemas/Comments.schema';
import { AppModule } from 'src/app.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DynamooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DynamooseConfigService,
      inject: [ConfigService],
    }),
    DynamooseModule.forFeature([
      { name: 'Article', schema: ArticleSchema },
      { name: 'Comments', schema: CommentsSchema },
    ]),
    forwardRef(() => AppModule),
  ],
  controllers: [PostController, CommentController],
  providers: [PostService],
})
export class PostModule {}
