"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postDomainEvent = void 0;
const DomainEvent_1 = require("../../../../common/elements/DomainEvent");
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getDomainEventSchema_1 = require("../../../../common/schemas/getDomainEventSchema");
const defekt_1 = require("defekt");
const validateContentType_1 = require("../../../base/validateContentType");
const validateDomainEvent_1 = require("../../../../common/validators/validateDomainEvent");
const validateFlowNames_1 = require("../../../../common/validators/validateFlowNames");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const postDomainEvent = {
    description: 'Accepts a domain event for further processing.',
    path: '',
    request: {
        body: {
            type: 'object',
            properties: {
                flowNames: {
                    type: 'array',
                    items: { type: 'string', minLength: 1 },
                    minItems: 1
                },
                domainEvent: getDomainEventSchema_1.getDomainEventSchema()
            },
            required: ['domainEvent'],
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 400, 415],
        body: { type: 'object' }
    },
    getHandler({ onReceiveDomainEvent, application }) {
        const requestBodySchema = new validate_value_1.Value(postDomainEvent.request.body), responseBodySchema = new validate_value_1.Value(postDomainEvent.response.body);
        return async function (req, res) {
            var _a;
            try {
                validateContentType_1.validateContentType({
                    expectedContentType: 'application/json',
                    req
                });
                try {
                    requestBodySchema.validate(req.body, { valueName: 'requestBody' });
                }
                catch (ex) {
                    throw new errors_1.errors.RequestMalformed(ex.message);
                }
                const flowNames = (_a = req.body.flowNames) !== null && _a !== void 0 ? _a : Object.keys(application.flows);
                const domainEvent = new DomainEvent_1.DomainEvent(req.body.domainEvent);
                validateFlowNames_1.validateFlowNames({ flowNames, application });
                validateDomainEvent_1.validateDomainEvent({ domainEvent, application });
                logger.debug('Received domain event.', withLogMetadata_1.withLogMetadata('api', 'handleDomainEvent', { flowNames, domainEvent }));
                await onReceiveDomainEvent({ flowNames, domainEvent });
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
                    case errors_1.errors.FlowNotFound.code:
                    case errors_1.errors.ContextNotFound.code:
                    case errors_1.errors.AggregateNotFound.code:
                    case errors_1.errors.DomainEventNotFound.code:
                    case errors_1.errors.DomainEventMalformed.code:
                    case errors_1.errors.RequestMalformed.code: {
                        res.status(400).json({
                            code: error.code,
                            message: error.message
                        });
                        return;
                    }
                    default: {
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'handleDomainEvent', { error }));
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
exports.postDomainEvent = postDomainEvent;
//# sourceMappingURL=postDomainEvent.js.map