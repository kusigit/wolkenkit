"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDomainEvents = void 0;
const ClientMetadata_1 = require("../../../../common/utils/http/ClientMetadata");
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getAggregatesService_1 = require("../../../../common/services/getAggregatesService");
const getClientService_1 = require("../../../../common/services/getClientService");
const getDomainEventSchema_1 = require("../../../../common/schemas/getDomainEventSchema");
const getLoggerService_1 = require("../../../../common/services/getLoggerService");
const defekt_1 = require("defekt");
const p_queue_1 = __importDefault(require("p-queue"));
const prepareForPublication_1 = require("../../../../common/domain/domainEvent/prepareForPublication");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const writeLine_1 = require("../../../base/writeLine");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getDomainEvents = {
    description: 'Streams domain events live.',
    path: '',
    request: {
        query: {
            type: 'object',
            properties: {
                filter: { type: 'object' }
            },
            additionalProperties: false
        }
    },
    response: {
        statusCodes: [200, 400],
        stream: true,
        body: getDomainEventSchema_1.getDomainEventSchema()
    },
    getHandler({ domainEventEmitter, application, repository, heartbeatInterval }) {
        const querySchema = new validate_value_1.Value(getDomainEvents.request.query), responseBodySchema = new validate_value_1.Value(getDomainEvents.response.body);
        const aggregatesService = getAggregatesService_1.getAggregatesService({ repository });
        return async function (req, res) {
            var _a, _b;
            try {
                try {
                    querySchema.validate(req.query, { valueName: 'requestQuery' });
                }
                catch (ex) {
                    throw new errors_1.errors.RequestMalformed(ex.message);
                }
                const domainEventQueue = new p_queue_1.default({ concurrency: 1 });
                const clientService = getClientService_1.getClientService({ clientMetadata: new ClientMetadata_1.ClientMetadata({ req }) });
                const domainEventFilter = ((_a = req.query.filter) !== null && _a !== void 0 ? _a : {});
                const handleDomainEvent = (domainEventWithState) => {
                    /* eslint-disable @typescript-eslint/no-floating-promises */
                    domainEventQueue.add(async () => {
                        const domainEvent = await prepareForPublication_1.prepareForPublication({
                            domainEventWithState,
                            domainEventFilter,
                            application,
                            repository,
                            services: {
                                aggregates: aggregatesService,
                                client: clientService,
                                logger: getLoggerService_1.getLoggerService({
                                    fileName: `<app>/server/domain/${domainEventWithState.aggregateIdentifier.context.name}/${domainEventWithState.aggregateIdentifier.aggregate.name}/`,
                                    packageManifest: application.packageManifest
                                }),
                                infrastructure: {
                                    ask: application.infrastructure.ask
                                }
                            }
                        });
                        if (!domainEvent) {
                            return;
                        }
                        responseBodySchema.validate(domainEvent, { valueName: 'responseBody' });
                        logger.debug('Publishing domain event to client...', withLogMetadata_1.withLogMetadata('api', 'observeDomainEvents', { domainEvent }));
                        writeLine_1.writeLine({ res, data: domainEvent });
                    });
                    /* eslint-enable @typescript-eslint/no-floating-promises */
                };
                res.startStream({ heartbeatInterval });
                (_b = res.socket) === null || _b === void 0 ? void 0 : _b.once('close', () => {
                    domainEventEmitter.off(handleDomainEvent);
                    domainEventQueue.clear();
                });
                domainEventEmitter.on(handleDomainEvent);
            }
            catch (ex) {
                // It can happen that the connection gets closed in the background, and
                // hence the underlying socket does not have a remote address any more. We
                // can't detect this using an if statement, because connection handling is
                // done by Node.js in a background thread, and we may have a race
                // condition here. So, we decided to actively catch this exception, and
                // take it as an indicator that the connection has been closed meanwhile.
                if (ex instanceof Error && ex.message === 'Remote address is missing.') {
                    return;
                }
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
                        logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'observeDomainEvents', { error }));
                    }
                }
            }
        };
    }
};
exports.getDomainEvents = getDomainEvents;
//# sourceMappingURL=getDomainEvents.js.map