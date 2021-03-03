"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeSnapshot = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getSnapshotSchema_1 = require("../../../../common/schemas/getSnapshotSchema");
const defekt_1 = require("defekt");
const validateContentType_1 = require("../../../base/validateContentType");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const storeSnapshot = {
    description: 'Stores a snapshot.',
    path: 'store-snapshot',
    request: {
        body: getSnapshotSchema_1.getSnapshotSchema()
    },
    response: {
        statusCodes: [200, 400, 415],
        body: { type: 'object' }
    },
    getHandler({ domainEventStore }) {
        const requestBodySchema = new validate_value_1.Value(storeSnapshot.request.body), responseBodySchema = new validate_value_1.Value(storeSnapshot.response.body);
        return async function (req, res) {
            try {
                validateContentType_1.validateContentType({
                    expectedContentType: 'application/json',
                    req
                });
                const snapshot = req.body;
                try {
                    requestBodySchema.validate(snapshot, { valueName: 'requestBody' });
                }
                catch (ex) {
                    throw new errors_1.errors.SnapshotMalformed(ex.message);
                }
                await domainEventStore.storeSnapshot({ snapshot });
                const response = {};
                responseBodySchema.validate(response, { valueName: 'responseBody' });
                res.status(200).json(response);
            }
            catch (ex) {
                const error = defekt_1.isCustomError(ex) ?
                    ex :
                    new errors_1.errors.UnknownError(undefined, { cause: ex });
                switch (error.code) {
                    case errors_1.errors.ContentTypeMismatch.code: {
                        res.status(415).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    case errors_1.errors.SnapshotMalformed.code: {
                        res.status(400).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'writeDomainEventStore', { error }));
                        res.status(500).json({
                            code: error.code,
                            message: error.message
                        });
                    }
                }
            }
        };
    }
};
exports.storeSnapshot = storeSnapshot;
//# sourceMappingURL=storeSnapshot.js.map