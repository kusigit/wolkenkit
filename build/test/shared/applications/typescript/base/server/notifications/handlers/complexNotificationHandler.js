"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complexNotificationHandler = void 0;
const complexNotificationHandler = {
    getDataSchema() {
        return {
            type: 'object',
            properties: {
                message: { type: 'string', minLength: 1 }
            },
            required: ['message']
        };
    },
    getMetadataSchema() {
        return {
            type: 'object',
            properties: {
                public: { type: 'boolean' }
            },
            required: ['public']
        };
    },
    isAuthorized(data, metadata) {
        return metadata.public;
    }
};
exports.complexNotificationHandler = complexNotificationHandler;
//# sourceMappingURL=complexNotificationHandler.js.map