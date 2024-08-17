import * as dynamoose from 'dynamoose';

export const UsersSchema = new dynamoose.Schema(
  {
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    noticeId: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: () => new Date(),
    },
    updatedAt: {
        type: Date,
        default: () => new Date(),
    }
  },
);
