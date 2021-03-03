"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const defekt_1 = require("defekt");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const writeLine_1 = require("../../../base/writeLine");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getMessages = {
    description: 'Subscribes to messages.',
    path: ':channel',
    request: {},
    response: {
        statusCodes: [200],
        stream: true,
        body: {}
    },
    getHandler({ messageEmitter, heartbeatInterval }) {
        return async function (req, res) {
            var _a;
            try {
                const { channel } = req.params;
                const handleMessage = (message) => {
                    writeLine_1.writeLine({ res, data: message });
                };
                res.startStream({ heartbeatInterval });
                (_a = res.socket) === null || _a === void 0 ? void 0 : _a.once('close', () => {
                    messageEmitter.off(channel, handleMessage);
                });
                messageEmitter.on(channel, handleMessage);
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
                logger.error('An unexpected error occured.', withLogMetadata_1.withLogMetadata('api', 'subscribeMessages', { error }));
            }
        };
    }
};
exports.getMessages = getMessages;
//# sourceMappingURL=getMessages.js.map