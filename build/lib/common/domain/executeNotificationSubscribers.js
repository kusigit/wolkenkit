"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeNotificationSubscribers = void 0;
const errors_1 = require("../errors");
const flaschenpost_1 = require("flaschenpost");
const withLogMetadata_1 = require("../utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const executeNotificationSubscribers = async function ({ application, notification, viewName, services }) {
    if (!(viewName in application.views)) {
        throw new errors_1.errors.ViewNotFound(`View '${viewName}' not found.`);
    }
    const viewDefinition = application.views[viewName];
    if (!viewDefinition.notificationSubscribers) {
        return;
    }
    for (const [notificationSubscriberName, notificationSubscriber] of Object.entries(viewDefinition.notificationSubscribers)) {
        if (!notificationSubscriber.isRelevant({ name: notification.name })) {
            continue;
        }
        try {
            await notificationSubscriber.handle(notification.data, {
                ...services,
                infrastructure: application.infrastructure
            });
        }
        catch (ex) {
            logger.error(`A notification subscriber threw an error.`, withLogMetadata_1.withLogMetadata('common', 'executeNotificationSubscriber', { error: ex, viewName, notificationSubscriberName }));
            throw ex;
        }
    }
};
exports.executeNotificationSubscribers = executeNotificationSubscribers;
//# sourceMappingURL=executeNotificationSubscribers.js.map