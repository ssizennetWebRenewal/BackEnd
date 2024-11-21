import * as dynamoose from 'dynamoose';

export const SettingsSchema = new dynamoose.Schema({
  categoryType: {
      type: String,
      hashKey: true,
      required: true,
      index: {
        name: 'CategoryTypeIndex',
        project: true
      }
  },
  category: {
    type: String,
    rangeKey: true,
    required: true,
    index: {
      name: 'CategoryIndex',
      project: true
    }
  },
  items: {
    type: Array,
    required: false,
    schema: [
      {
        type: Object,
        schema: {
          item: { type: String },
          description: { type: String }
        }
      }
    ]
  }
});
