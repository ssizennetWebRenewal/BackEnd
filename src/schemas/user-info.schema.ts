import { Schema, model } from 'dynamoose';

export const UserInfoSchema = new Schema(
  {
    user_id: {
      type: String,
      hashKey: true,
      required: true
    },
    user_generation: {
      type: Number,
      rangeKey: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    approval: {
      type: Boolean,
      required: true
    },
    created_at: {
      type: Date,
      default: () => new Date(),
      required: true
    },
    modified_at: {
      type: Date,
      default: () => new Date(),
      required: true
    },
  },
  {
    timestamps: true,
  },
);
