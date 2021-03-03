"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeDomainEvents = void 0;
const DomainEvent_1 = require("../../../../common/elements/DomainEvent");
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getDomainEventSchema_1 = require("../../../../common/schemas/getDomainEventSchema");
const defekt_1 = require("defekt");
const validateContentType_1 = require("../../../base/validateContentType");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const domainEventSchema = new validate_value_1.Value(getDomainEventSchema_1.getDomainEventSchema());
const logger = flaschenpost_1.flaschenpost.getLogger();
const storeDomainEvents = {
    description: 'Stores domain events.',
    path: 'store-domain-events',
    request: {
        body: {
            type: 'array',
            items: getDomainEventSchema_1.getDomainEventSchema()
        }
    },
    response: {
        statusCodes: [200, 400, 409, 415],
        body: { type: 'object' }
    },
    getHandler({ domainEventStore }) {
        const responseBodySchema = new validate_value_1.Value(storeDomainEvents.response.body);
        return async function (req, res) {
            try {
                validateContentType_1.validateContentType({
                    expectedContentType: 'application/json',
                    req
                });
                if (!Array.isArray(req.body)) {
                    throw new errors_1.errors.RequestMalformed('Request body must be an array of domain events.');
                }
                if (req.body.length === 0) {
                    throw new errors_1.errors.ParameterInvalid('Domain events are missing.');
                }
                const domainEvents = req.body.map((domainEvent) => new DomainEvent_1.DomainEvent(domainEvent));
                for (const domainEvent of domainEvents) {
                    try {
                        domainEventSchema.validate(domainEvent);
                    }
                    catch (ex) {
                        throw new errors_1.errors.DomainEventMalformed(ex.message);
                    }
                }
                await domainEventStore.storeDomainEvents({ domainEvents });
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
                    case errors_1.errors.RequestMalformed.code:
                    case errors_1.errors.ParameterInvalid.code:
                    case errors_1.errors.DomainEventMalformed.code: {
                        res.status(400).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    case errors_1.errors.RevisionAlreadyExists.code: {
                        res.status(409).json({
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
exports.storeDomainEvents = storeDomainEvents;
//# sourceMappingURL=storeDomainEvents.js.map