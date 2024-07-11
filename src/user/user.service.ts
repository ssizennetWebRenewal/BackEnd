import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { UserInfo, UserInfoKey } from 'src/interfaces/user-info.interface';

@Injectable()
export class UserService {
    constructor(
      @InjectModel('UserInfo')
      private userInfoModel: Model<UserInfo, UserInfoKey>,
    ) {}
  
    async saveUserInfo(
      user_id: string,
      user_idx: string,
      user_email: string,
    ) {
      const userData = {
        user_id,
        user_idx,
        user_email,
      };
      return this.userInfoModel.create(userData);
    }

    async test(user_id, user_idx, user_email) {
        const userData = {
            user_id,// 파티션 키
            user_idx,// 정렬 키
            user_email, // 데이터
          };
          this.userInfoModel.create(userData);
    }

    async test2(user_id, user_idx) {
        return this.userInfoModel.get({ user_id, user_idx }); 
    }
  }