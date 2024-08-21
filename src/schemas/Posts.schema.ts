import * as dynamoose from 'dynamoose';

export const PostsSchema = new dynamoose.Schema(
  {
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    topCategory: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        index: {
            name: "TitleIndex",
            rangeKey: 'createdAt',
            project: [
                "downloadCount", "subCategory", "updatedAt", "createdAt",
                "filePath", "registrant", "topCategory", "id", "body", "title"
            ]
        }
    },
    registrantId: {
        type: String,
        required: true,
        index: {
            name: "RegistrantIdIndex",
            rangeKey: 'createdAt',
            project: [
                "downloadCount", "subCategory", "updatedAt", "createdAt",
                "filePath", "registrant", "topCategory", "id", "body", "title"
            ]
        }
    },
    registrantName: {
        type: String,
        required: true
    },
    downloadCount: {
        type: Number,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    filePaths: {
        type: String,
        required: true
    },
    createdAt: {
        type: Number,
        default: () => Date.now(),
    },
    updatedAt: {
        type: Number,
        default: () => Date.now()
    },
    constTrue: {
        type: Number,
        required: true,
        default: 1,
        index: {
            name: "DateIndex",
            rangeKey: "createdAt",
            project: [
                "downloadCount", "subCategory", "updatedAt", "createdAt",
                "filePath", "registrant", "topCategory", "id", "body", "title"
            ]
        }
    }
  },
);
