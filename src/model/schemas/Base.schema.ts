import * as dynamoose from 'dynamoose';
import { v7 } from 'uuid';

export class BaseSchema extends dynamoose.Schema {
  constructor(extraSchema: object) {
    super(
      {
        id: {
          type: String,
          hashKey: true,
          required: true,
          default: () => generateUUID(),
        },
        createdAt: {
          type: String,
          required: true,
          default: () => new Date().toISOString()
        },
        updatedAt: {
          type: String,
          required: true,
          default: () => new Date().toISOString()
        },
        ...extraSchema,
      }
    );
  }
}

function generateUUID(): string {
  return v7().toString();
}
