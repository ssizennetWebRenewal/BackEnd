import * as dynamoose from 'dynamoose';

export const CommentsSchema = new dynamoose.Schema(
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
        required: true,
        index: {
            name: 'NoticeIdCreatedAtIndex',
            rangeKey: 'createdAt',
            project: ['ALL']
        }
    },
    body: {
        type: String,
        required: true
    },
    createdAt: {
        type: Number,
        required: true,
        default: () => Date.now(),
    },
    updatedAt: {
        type: Number,
        required: true,
        default: () => Date.now(),
    }
  },
);
