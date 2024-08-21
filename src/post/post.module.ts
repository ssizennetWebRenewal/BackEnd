import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseConfigService } from 'src/dynamoose-config.service';
import { PostsSchema } from 'src/schemas/Posts.schema';
import { CommentsSchema } from 'src/schemas/Comments.schema';

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
      { name: 'Posts', schema: PostsSchema },
      { name: 'Comments', schema: CommentsSchema },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule {}
