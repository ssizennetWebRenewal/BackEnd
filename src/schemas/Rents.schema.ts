import * as dynamoose from 'dynamoose';

export const RentsSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    team: {
        type: String,
        required: true,
        index: {
            name: "TeamIndex",
            project: ["id", "startDate", "endDate", "team", "title", "applicant", "approved", "createdAt", "updatedAt"]
        }
    },
    title: {
        type: String,
        required: true
    },
    applicant: {
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
            project: ["id", "startDate", "endDate", "team", "title", "applicant", "approved", "createdAt", "updatedAt"]
        }
    }
});
