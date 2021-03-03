"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerformReplay = void 0;
const DomainEvent_1 = require("../../../../common/elements/DomainEvent");
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getPerformReplay = function ({ domainEventStore, domainEventDispatcherClient }) {
    return async function ({ flowNames, aggregates }) {
        try {
            logger.debug('Performing replay...', withLogMetadata_1.withLogMetadata('runtime', 'microservice/replay', { flowNames, aggregates }));
            for (const aggregate of aggregates) {
                const domainEventStream = await domainEventStore.getReplayForAggregate({
                    aggregateId: aggregate.aggregateIdentifier.aggregate.id,
                    fromRevision: aggregate.from,
                    toRevision: aggregate.to
                });
                for await (const rawDomainEvent of domainEventStream) {
                    const domainEvent = new DomainEvent_1.DomainEvent(rawDomainEvent);
                    await domainEventDispatcherClient.postDomainEvent({ flowNames, domainEvent });
                }
            }
            logger.debug('Replay performed.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/replay', { flowNames, aggregates }));
        }
        catch (ex) {
            logger.error('Failed to perform replay.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/replay', { flowNames, aggregates, error: ex }));
            throw new errors_1.errors.ReplayFailed('Failed to perform replay.', {
                cause: ex,
                data: { flowNames, aggregates }
            });
        }
    };
};
exports.getPerformReplay = getPerformReplay;
//# sourceMappingURL=getPerformReplay.js.map