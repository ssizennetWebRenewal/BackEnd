import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { UserInfoSchema } from 'src/schemas/user-info.schema';

@Module({
  imports: [
    DynamooseModule.forFeature([
      { name: 'UserInfo', schema: UserInfoSchema}
    ])
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
