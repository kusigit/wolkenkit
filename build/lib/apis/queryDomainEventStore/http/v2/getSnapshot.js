"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnapshot = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getAggregateIdentifierSchema_1 = require("../../../../common/schemas/getAggregateIdentifierSchema");
const getSnapshotSchema_1 = require("../../../../common/schemas/getSnapshotSchema");
const defekt_1 = require("defekt");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getSnapshot = {
    description: 'Returns the latest snapshot for an aggeragte.',
    path: 'snapshot',
    request: {
        query: {
            type: 'object',
            properties: {
                aggregateIdentifier: getAggregateIdentifierSchema_1.getAggregateIdentifierSchema()
            },
            required: ['aggregateIdentifier'],
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 400, 404],
        body: getSnapshotSchema_1.getSnapshotSchema()
    },
    getHandler({ domainEventStore }) {
        const querySchema = new validate_value_1.Value(getSnapshot.request.query), responseBodySchema = new validate_value_1.Value(getSnapshot.response.body);
        return async function (req, res) {
            try {
                const { aggregateIdentifier } = req.query;
                try {
                    querySchema.validate(req.query, { valueName: 'requestQuery' });
                }
                catch (ex) {
                    throw new errors_1.errors.RequestMalformed(ex.message);
                }
                const snapshot = await domainEventStore.getSnapshot({ aggregateIdentifier });
                if (!snapshot) {
                    throw new errors_1.errors.SnapshotNotFound();
                }
                responseBodySchema.validate(snapshot, { valueName: 'responseBody' });
                res.json(snapshot);
            }
            catch (ex) {
                const error = defekt_1.isCustomError(ex) ?
                    ex :
                    new errors_1.errors.UnknownError(undefined, { cause: ex });
                switch (error.code) {
                    case errors_1.errors.RequestMalformed.code: {
                        res.status(400).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    case errors_1.errors.SnapshotNotFound.code: {
                        res.status(404).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'queryDomainEventStore', { error }));
                        return res.status(400).json({
                            code: error.code,
                            message: error.message
                        });
                    }
                }
            }
        };
    }
};
exports.getSnapshot = getSnapshot;
//# sourceMappingURL=getSnapshot.js.map