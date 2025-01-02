import * as dynamoose from 'dynamoose';

export const RefreshTokenSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
    required: true,
  },
  refresh: {
    type: String,
    required: true,
  },
  authority: {
    type: Array,
    schema: [String],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  issuedAt: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Number,
    required: true,
  },
});
