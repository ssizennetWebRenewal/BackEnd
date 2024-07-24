import { Schema, model } from 'dynamoose';
//const lifetimeLatency = () => Math.floor((Date.now() + 5 * 60 * 1000) / 1000);//일단 5분으로 설정 (단위 : ms) - 나중에 환경 변수에서 설정해야 함

export const SessionsSchema = new Schema(
  {
    session_id: {
      type: String,
      hashKey: true,
      required: true
    },
    exp: {
      type: Number,
      rangeKey: true,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
      index: {
        name: 'user_id-exp-index',
        project: true,
      },
    },
  },
  {
    timestamps: true,
  },
);
