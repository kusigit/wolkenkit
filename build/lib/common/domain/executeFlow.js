"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeFlow = void 0;
const errors_1 = require("../errors");
const flaschenpost_1 = require("flaschenpost");
const withLogMetadata_1 = require("../utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const executeFlow = async function ({ application, flowName, domainEvent, flowProgressStore, services, performReplay }) {
    if (!(flowName in application.flows)) {
        throw new errors_1.errors.FlowNotFound(`Flow '${flowName}' not found.`);
    }
    logger.debug(`Executing flow...`, withLogMetadata_1.withLogMetadata('common', 'executeFlow', { flowName, domainEvent }));
    const flowDefinition = application.flows[flowName];
    const { revision: latestHandledRevision, isReplaying } = await flowProgressStore.getProgress({
        consumerId: flowName,
        aggregateIdentifier: domainEvent.aggregateIdentifier
    });
    if (latestHandledRevision >= domainEvent.metadata.revision) {
        logger.debug('Domain event was already seen, skipping.', withLogMetadata_1.withLogMetadata('common', 'executeFlow', { flowName }));
        return 'acknowledge';
    }
    if (latestHandledRevision < domainEvent.metadata.revision - 1) {
        switch (flowDefinition.replayPolicy) {
            case 'never': {
                logger.debug(`Domain event is too new. Ignoring due to replay policy 'never'.`, withLogMetadata_1.withLogMetadata('common', 'executeFlow', { flowName }));
                break;
            }
            case 'on-demand': {
                logger.debug(`Domain event is too new. Deferring due to replay policy 'on-demand'.`, withLogMetadata_1.withLogMetadata('common', 'executeFlow', { flowName }));
                return 'defer';
            }
            case 'always': {
                if (!isReplaying) {
                    const from = latestHandledRevision + 1, to = domainEvent.metadata.revision - 1;
                    logger.debug(`Domain event is too new. Requesting replay and deferring due to replay policy 'always'.`, withLogMetadata_1.withLogMetadata('common', 'executeFlow', { flowName, from, to }));
                    await performReplay({
                        flowNames: [flowName],
                        aggregates: [{
                                aggregateIdentifier: domainEvent.aggregateIdentifier,
                                from,
                                to
                            }]
                    });
                    await flowProgressStore.setIsReplaying({
                        consumerId: flowName,
                        aggregateIdentifier: domainEvent.aggregateIdentifier,
                        isReplaying: { from, to }
                    });
                }
                return 'defer';
            }
            default: {
                throw new errors_1.errors.InvalidOperation();
            }
        }
    }
    for (const [handlerName, handler] of Object.entries(flowDefinition.domainEventHandlers)) {
        if (handler.isRelevant({
            fullyQualifiedName: domainEvent.getFullyQualifiedName(),
            itemIdentifier: domainEvent.getItemIdentifier()
        })) {
            logger.debug(`Executing flow handler...`, withLogMetadata_1.withLogMetadata('common', 'executeFlow', { flowName, handlerName }));
            try {
                await handler.handle(domainEvent, services);
            }
            catch (ex) {
                logger.error(`A flow handler threw an error.`, withLogMetadata_1.withLogMetadata('common', 'executeFlow', { error: ex, flowName, handlerName }));
                throw ex;
            }
        }
    }
    await flowProgressStore.setProgress({
        consumerId: flowName,
        aggregateIdentifier: domainEvent.aggregateIdentifier,
        revision: domainEvent.metadata.revision
    });
    if (isReplaying && isReplaying.to === domainEvent.metadata.revision) {
        await flowProgressStore.setIsReplaying({
            consumerId: flowName,
            aggregateIdentifier: domainEvent.aggregateIdentifier,
            isReplaying: false
        });
    }
    logger.debug(`Flow successfully executed.`, withLogMetadata_1.withLogMetadata('common', 'executeFlow', { flowName }));
    return 'acknowledge';
};
exports.executeFlow = executeFlow;
//# sourceMappingURL=executeFlow.js.map