import { BaseSchema } from './Base.schema';

export const ArticleSchema = new BaseSchema({
  topCategory: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    index: {
      name: 'TitleIndex',
      rangeKey: 'createdAt',
      project: [
        'downloadCount',
        'subCategory',
        'updatedAt',
        'createdAt',
        'filePath',
        'registrant',
        'topCategory',
        'id',
        'body',
        'title',
      ],
    },
  },
  registrantId: {
    type: String,
    required: true,
    index: {
      name: 'RegistrantIdIndex',
      rangeKey: 'createdAt',
      project: [
        'downloadCount',
        'subCategory',
        'updatedAt',
        'createdAt',
        'filePath',
        'registrant',
        'topCategory',
        'id',
        'body',
        'title',
      ],
    },
  },
  registrantName: {
    type: String,
    required: true,
  },
  downloadCount: {
    type: Number,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  filePaths: {
    type: Array,
    schema: [String],
    required: false,
  },
  youtubePath: {
    type: String,
    required: false,
  },
  constTrue: {
    type: Number,
    required: true,
    default: 1,
    index: {
      name: 'DateIndex',
      rangeKey: 'createdAt',
      project: [
        'downloadCount',
        'subCategory',
        'updatedAt',
        'createdAt',
        'filePath',
        'registrant',
        'topCategory',
        'id',
        'body',
        'title',
      ],
    },
  },
});
