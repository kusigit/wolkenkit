"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = void 0;
const ClientMetadata_1 = require("../../../../common/utils/http/ClientMetadata");
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getClientService_1 = require("../../../../common/services/getClientService");
const getLoggerService_1 = require("../../../../common/services/getLoggerService");
const defekt_1 = require("defekt");
const validateNotification_1 = require("../../../../common/validators/validateNotification");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const writeLine_1 = require("../../../base/writeLine");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getNotifications = {
    description: 'Subscribes to notifications.',
    path: '',
    request: {},
    response: {
        statusCodes: [200],
        stream: true,
        body: {}
    },
    getHandler({ application, subscriber, channelForNotifications, heartbeatInterval }) {
        return async function (req, res) {
            var _a;
            try {
                const handleNotification = (notification) => {
                    try {
                        validateNotification_1.validateNotification({ notification, application });
                    }
                    catch {
                        logger.warn('Dropping invalid notification.', withLogMetadata_1.withLogMetadata('api', 'subscribeNotifications', { notification }));
                        return;
                    }
                    const notificationHandler = application.notifications[notification.name];
                    const isNotificationAuthorized = notificationHandler.isAuthorized(notification.data, notification.metadata, {
                        logger: getLoggerService_1.getLoggerService({
                            fileName: `<app>/server/notifications/${notification.name}`,
                            packageManifest: application.packageManifest
                        }),
                        infrastructure: application.infrastructure,
                        client: getClientService_1.getClientService({ clientMetadata: new ClientMetadata_1.ClientMetadata({ req }) })
                    });
                    if (!isNotificationAuthorized) {
                        return;
                    }
                    const notificationWithoutMetadata = {
                        name: notification.name,
                        data: notification.data
                    };
                    writeLine_1.writeLine({ res, data: notificationWithoutMetadata });
                };
                res.startStream({ heartbeatInterval });
                (_a = res.socket) === null || _a === void 0 ? void 0 : _a.once('close', async () => {
                    await subscriber.unsubscribe({ channel: channelForNotifications, callback: handleNotification });
                });
                await subscriber.subscribe({ channel: channelForNotifications, callback: handleNotification });
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
                logger.error('An unexpected error occured.', withLogMetadata_1.withLogMetadata('api', 'subscribeNotifications', { error }));
            }
        };
    }
};
exports.getNotifications = getNotifications;
//# sourceMappingURL=getNotifications.js.map