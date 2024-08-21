import * as dynamoose from 'dynamoose';

export const VideosSchema = new dynamoose.Schema(
  {
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    category: {
        type: String,
        required: true,
        index: {
            name: "CategoryIndex",
            project: ["uploadDate", "caption", "updatedAt", "category", "createdAt", "link", "thumbnail", "id", "title"]
        }
    },
    title: {
        type: String,
        required: true,
        index: {
            name: "TitleIndex",
            project: ["uploadDate", "caption", "updatedAt", "category", "createdAt", "link", "thumbnail", "id", "title"]
        }
    },
    uploadDate: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    writer: {
        type: String,
        required: true,
      },
    createdAt: {
        type: Date,
        rangeKey: true,
        default: () => new Date(),
    },
    updatedAt: {
        type: Date,
        default: () => new Date(),
    },
    constTrue: {
        type: Number,
        default: 1,
        index: {
            name: "DateIndex",
            project: ["uploadDate", "caption", "updatedAt", "category", "createdAt", "link", "thumbnail", "id", "title"]
        }
    }
  },
);
