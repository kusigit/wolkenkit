"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNotification = void 0;
const errors_1 = require("../errors");
const validate_value_1 = require("validate-value");
const validateNotification = function ({ notification, application }) {
    const notificationDefinitions = application.notifications;
    const { name, data, metadata } = notification;
    if (!(name in notificationDefinitions)) {
        throw new errors_1.errors.NotificationNotFound(`Notification '${name}' not found.`);
    }
    const { getDataSchema, getMetadataSchema } = notificationDefinitions[name];
    if (getDataSchema) {
        const schema = getDataSchema();
        const value = new validate_value_1.Value(schema);
        value.validate(data, { valueName: 'notification.data' });
    }
    if (getMetadataSchema) {
        const schema = getMetadataSchema();
        const value = new validate_value_1.Value(schema);
        value.validate(metadata, { valueName: 'notification.metadata' });
    }
};
exports.validateNotification = validateNotification;
//# sourceMappingURL=validateNotification.js.map