"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnCancelCommand = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getOnCancelCommand = function ({ commandDispatcher }) {
    return async function ({ commandIdentifierWithClient }) {
        try {
            logger.debug('Cancelling command in command dispatcher...', withLogMetadata_1.withLogMetadata('runtime', 'microservice/command', { commandIdentifierWithClient }));
            await commandDispatcher.client.cancelCommand({ commandIdentifierWithClient });
            logger.debug('Cancelled command in command dispatcher.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/command', { commandIdentifierWithClient }));
        }
        catch (ex) {
            logger.error('Failed to cancel command in command dispatcher.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/command', { commandIdentifierWithClient, error: ex }));
            throw new errors_1.errors.RequestFailed('Failed to cancel command in command dispatcher.', {
                cause: ex,
                data: { commandIdentifierWithClient }
            });
        }
    };
};
exports.getOnCancelCommand = getOnCancelCommand;
//# sourceMappingURL=getOnCancelCommand.js.map