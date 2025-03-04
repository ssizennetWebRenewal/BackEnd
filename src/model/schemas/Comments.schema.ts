import { BaseSchema } from './Base.schema';

export const CommentsSchema = new BaseSchema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  noticeId: {
    type: String,
    required: true,
    index: {
      name: 'NoticeIdCreatedAtIndex',
      rangeKey: 'createdAt',
      project: ['ALL'],
    },
  },
  replyId: {
    type: String || null,
    default: null,
    require: false
  },
  body: {
    type: String,
    required: true,
  },
});
