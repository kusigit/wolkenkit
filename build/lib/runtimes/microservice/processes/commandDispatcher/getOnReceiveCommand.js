"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnReceiveCommand = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getOnReceiveCommand = function ({ priorityQueueStore, newCommandPublisher, newCommandPubSubChannel }) {
    return async function ({ command }) {
        try {
            logger.debug('Enqueueing command in priority queue...', withLogMetadata_1.withLogMetadata('runtime', 'microservice/commandDispatcher', { command }));
            await priorityQueueStore.enqueue({
                item: command,
                discriminator: command.aggregateIdentifier.aggregate.id,
                priority: command.metadata.timestamp
            });
            await newCommandPublisher.publish({
                channel: newCommandPubSubChannel,
                message: {}
            });
            logger.debug('Enqueued command in priority queue.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/commandDispatcher', { command }));
        }
        catch (ex) {
            logger.error('Failed to enqueue command in priority queue.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/commandDispatcher', { command, error: ex }));
            throw new errors_1.errors.RequestFailed('Failed to enqueue command in priority queue.', {
                cause: ex,
                data: { command }
            });
        }
    };
};
exports.getOnReceiveCommand = getOnReceiveCommand;
//# sourceMappingURL=getOnReceiveCommand.js.map