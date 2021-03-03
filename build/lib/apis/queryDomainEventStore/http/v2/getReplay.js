"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReplay = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getDomainEventSchema_1 = require("../../../../common/schemas/getDomainEventSchema");
const defekt_1 = require("defekt");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const writeLine_1 = require("../../../base/writeLine");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getReplay = {
    description: 'Streams a replay of all domain events, optionally starting and ending at given revisions.',
    path: 'replay',
    request: {
        query: {
            type: 'object',
            properties: {
                fromTimestamp: { type: 'number', minimum: 0 }
            },
            required: [],
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 400],
        stream: true,
        body: getDomainEventSchema_1.getDomainEventSchema()
    },
    getHandler({ domainEventStore, heartbeatInterval }) {
        const querySchema = new validate_value_1.Value(getReplay.request.query), responseBodySchema = new validate_value_1.Value(getReplay.response.body);
        return async function (req, res) {
            try {
                try {
                    querySchema.validate(req.query, { valueName: 'requestQuery' });
                }
                catch (ex) {
                    throw new errors_1.errors.RequestMalformed(ex.message);
                }
                const fromTimestamp = req.query.fromTimestamp;
                res.startStream({ heartbeatInterval });
                const domainEventStream = await domainEventStore.getReplay({ fromTimestamp });
                for await (const domainEvent of domainEventStream) {
                    try {
                        responseBodySchema.validate(domainEvent, { valueName: 'responseBody' });
                        writeLine_1.writeLine({ res, data: domainEvent });
                    }
                    catch {
                        logger.warn('Dropped invalid domain event.', withLogMetadata_1.withLogMetadata('api', 'queryDomainEventStore', { domainEvent }));
                    }
                }
                return res.end();
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
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'queryDomainEventStore', { error }));
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
exports.getReplay = getReplay;
//# sourceMappingURL=getReplay.js.map