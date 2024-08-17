import * as dynamoose from 'dynamoose';

export const SettingsSchema = new dynamoose.Schema({
  categoryType: {
      type: String,
      hashKey: true,
      required: true
  },
  categories: {
    type: Array,
    required: false,
    schema: [
      {
        type: Object,
        schema: {
          category: {
            type: String
          },
          items: {
            type: Array,
            schema: [
              {
                type: Object,
                schema: {
                  item: String,
                  description: String
                }
              }
            ]
          }
        }
      }
    ]
  }
});
