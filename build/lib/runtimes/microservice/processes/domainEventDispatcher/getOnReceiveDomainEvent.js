"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnReceiveDomainEvent = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getOnReceiveDomainEvent = function ({ application, priorityQueueStore, newDomainEventPublisher, newDomainEventPubSubChannel }) {
    return async function ({ domainEvent }) {
        try {
            logger.debug('Enqueueing domain event in priority queue...', withLogMetadata_1.withLogMetadata('runtime', 'microservice/domainEventDispatcher', { domainEvent }));
            for (const flowName of Object.keys(application.flows)) {
                await priorityQueueStore.enqueue({
                    item: domainEvent,
                    discriminator: flowName,
                    priority: domainEvent.metadata.timestamp
                });
            }
            await newDomainEventPublisher.publish({
                channel: newDomainEventPubSubChannel,
                message: {}
            });
            logger.debug('Enqueued domain event in priority queue.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/domainEventDispatcher', { domainEvent }));
        }
        catch (ex) {
            logger.error('Failed to enqueue domain event in priority queue.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/domainEventDispatcher', { domainEvent, error: ex }));
            throw new errors_1.errors.RequestFailed('Failed to enqueue domain event in priority queue.', {
                cause: ex,
                data: { domainEvent }
            });
        }
    };
};
exports.getOnReceiveDomainEvent = getOnReceiveDomainEvent;
//# sourceMappingURL=getOnReceiveDomainEvent.js.map