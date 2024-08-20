import * as dynamoose from 'dynamoose';

export const RentsSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    startDate: {
        type: Number,
        required: true,
    },
    endDate: {
        type: Number,
        required: true
    },
    team: {
        type: String,
        required: true,
        index: {
            name: "TeamIndex",
            rangeKey: "startDate",
            project: ["id", "startDate", "endDate", "team", "title", "applicant", "approved", "createdAt", "updatedAt"]
        }
    },
    title: {
        type: String,
        required: true
    },
    applicantId: {
        type: String,
        required: true
    },
    applicantName: {
        type: String,
        required: true
    },
    approved: {
        type: Number,
        required: true
    },
    equipmentList: {
        type: Array,
        schema: [
            {
                type: Object,
                schema: {
                    category: {
                        type: String
                    },
                    items: {    
                        type: Array,
                        schema: [String]
                    }
                }
            }
        ],
        required: true
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
            rangeKey: "combinedDate",
            project: ["ALL"]
        }
    },
    combinedDate: {
        type: String,
        required: false,
    }
});
