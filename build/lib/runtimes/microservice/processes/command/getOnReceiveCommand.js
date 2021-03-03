"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnReceiveCommand = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const retry_ignore_abort_1 = require("retry-ignore-abort");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getOnReceiveCommand = function ({ commandDispatcher }) {
    return async function ({ command }) {
        try {
            logger.debug('Sending command to command dispatcher...', withLogMetadata_1.withLogMetadata('runtime', 'microservice/command', { command }));
            await retry_ignore_abort_1.retry(async () => {
                await commandDispatcher.client.postCommand({ command });
            }, { retries: commandDispatcher.retries, maxTimeout: 1000 });
            logger.debug('Sent command to command dispatcher.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/command', { command }));
        }
        catch (ex) {
            logger.error('Failed to send command to command dispatcher.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/command', { command, error: ex }));
            throw new errors_1.errors.RequestFailed('Failed to send command to command dispatcher.', {
                cause: ex,
                data: { command }
            });
        }
    };
};
exports.getOnReceiveCommand = getOnReceiveCommand;
//# sourceMappingURL=getOnReceiveCommand.js.map