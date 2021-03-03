"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnCancelCommand = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getOnCancelCommand = function ({ priorityQueueStore }) {
    return async function ({ commandIdentifierWithClient }) {
        try {
            logger.debug('Removing command from priority queue...', withLogMetadata_1.withLogMetadata('runtime', 'microservice/commandDispatcher', { commandIdentifierWithClient }));
            await priorityQueueStore.remove({
                itemIdentifier: commandIdentifierWithClient,
                discriminator: commandIdentifierWithClient.aggregateIdentifier.aggregate.id
            });
            logger.debug('Removed command from priority queue.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/commandDispatcher', { commandIdentifierWithClient }));
        }
        catch (ex) {
            logger.error('Failed to remove command from priority queue.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/commandDispatcher', { commandIdentifierWithClient, error: ex }));
            throw new errors_1.errors.RequestFailed('Failed to remove command from priority queue.', {
                cause: ex,
                data: { commandIdentifierWithClient }
            });
        }
    };
};
exports.getOnCancelCommand = getOnCancelCommand;
//# sourceMappingURL=getOnCancelCommand.js.map