import { BaseSchema } from './Base.schema';

export const VideosSchema = new BaseSchema({
  category: {
    type: String,
    required: true,
    index: {
      name: 'CategoryIndex',
      project: [
        'uploadDate',
        'caption',
        'updatedAt',
        'category',
        'createdAt',
        'link',
        'thumbnail',
        'id',
        'title',
      ],
    },
  },
  title: {
    type: String,
    required: true,
    index: {
      name: 'TitleIndex',
      project: [
        'uploadDate',
        'caption',
        'updatedAt',
        'category',
        'createdAt',
        'link',
        'thumbnail',
        'id',
        'title',
      ],
    },
  },
  uploadDate: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  writer: {
    type: String,
    required: true,
  },
  constTrue: {
    type: Number,
    default: 1,
    index: {
      name: 'DateIndex',
      project: [
        'uploadDate',
        'caption',
        'updatedAt',
        'category',
        'createdAt',
        'link',
        'thumbnail',
        'id',
        'title',
      ],
    },
  },
  approved: {
    type: Number,
    default: 0,
    required: true,
  },
});
