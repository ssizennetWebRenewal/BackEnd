import { Schema } from 'dynamoose';

export const UserInfoSchema = new Schema(
  {
    user_id: {
      type: String,
      hashKey: true,
      required: true,
    },
    user_idx: {
      type: String,
      rangeKey: true,
    },
    user_email: {
      type: String,
    },
  },
  {
    timestamps: true, // createdAt, updateAt 컬럼
    
    /* 이렇게 쓸 수도 있음
    timestamps: {
     * 		"createdAt": "createDate",
     * 		"updatedAt": null // updatedAt will not be stored as part of the timestamp
     * 	}
    */
  },
);