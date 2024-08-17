import * as dynamoose from 'dynamoose';

export const UsersSchema = new dynamoose.Schema(
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
            project: [
                "downloadCount", "subCategory", "updatedAt", "createdAt",
                "filePath", "registrant", "topCategory", "id", "body", "title"
            ]
        }
    },
    reqistrantId: {
        type: String,
        required: true,
        index: {
            name: "RegistrantIdIndex",
            project: [
                "downloadCount", "subCategory", "updatedAt", "createdAt",
                "filePath", "registrant", "topCategory", "id", "body", "title"
            ]
        }
    },
    reqistrantName: {
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
        type: Date,
        default: () => new Date(),
        index: [
            {
                name: "DateIndex",
                project: [
                    "downloadCount", "subCategory", "updatedAt", "createdAt",
                    "filePath", "registrant", "topCategory", "id", "body", "title"
                ]
            },
            {
                name: "RegistrantIdIndex",
                project: [
                    "downloadCount", "subCategory", "updatedAt", "createdAt",
                    "filePath", "registrant", "topCategory", "id", "body", "title"
                ]
            },
            {
                name: "TitleIndex",
                project: [
                    "downloadCount", "subCategory", "updatedAt", "createdAt",
                    "filePath", "registrant", "topCategory", "id", "body", "title"
                ]
            }
        ]
    },
    updatedAt: {
        type: Date,
        default: () => new Date()
    },
    constTrue: {
        type: Boolean,
        required: true,
        default: 1,
        index: {
            name: "DateIndex",
            project: [
                "downloadCount", "subCategory", "updatedAt", "createdAt",
                "filePath", "registrant", "topCategory", "id", "body", "title"
            ]
        }
    }
  },
);
