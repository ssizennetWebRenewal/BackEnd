import { BaseSchema } from './Base.schema';

export const UsersSchema = new BaseSchema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  approval: {
    type: Boolean,
    required: true,
    default: true, //추후 false로 변경
  },
  department: {
    type: String,
    required: true,
  },
  responsibility: {
    type: Array,
    schema: [String],
    required: true,
    default: [],
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  birthday: {
    type: String,
    required: true,
  },
  comments: {
    type: String,
  },
  photo: {
    type: String,
  },
});
