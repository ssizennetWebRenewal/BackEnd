import * as dynamoose from 'dynamoose';

export const UsersSchema = new dynamoose.Schema(
  {
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    approval: {
        type: Boolean,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    responsibility: {
        type: Array,
        schema: [String],
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    birthday: {
        type: String,
        required: true
    },
    comments: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        rangeKey: true,
        default: () => new Date(),
    },
    updatedAt: {
        type: Date,
        default: () => new Date(),
    }
  },
);
