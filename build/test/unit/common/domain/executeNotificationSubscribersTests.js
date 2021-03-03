"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const executeNotificationSubscribers_1 = require("../../../../lib/common/domain/executeNotificationSubscribers");
const getTestApplicationDirectory_1 = require("../../../shared/applications/getTestApplicationDirectory");
const loadApplication_1 = require("../../../../lib/common/application/loadApplication");
suite('executeNotificationSubscribers', () => {
    let application, loggedMessages, loggerService, notifications, notificationService;
    setup(async () => {
        const applicationDirectory = getTestApplicationDirectory_1.getTestApplicationDirectory({ name: 'base', language: 'javascript' });
        application = await loadApplication_1.loadApplication({ applicationDirectory });
        loggedMessages = [];
        loggerService = {
            debug(message, metadata) {
                loggedMessages.push({ level: 'debug', message, metadata });
            },
            info(message, metadata) {
                loggedMessages.push({ level: 'info', message, metadata });
            },
            warn(message, metadata) {
                loggedMessages.push({ level: 'warn', message, metadata });
            },
            error(message, metadata) {
                loggedMessages.push({ level: 'error', message, metadata });
            },
            fatal(message, metadata) {
                loggedMessages.push({ level: 'fatal', message, metadata });
            }
        };
        notifications = [];
        notificationService = {
            publish(name, data, metadata) {
                notifications.push({ name, data, metadata });
            }
        };
    });
    test('throws an error if the view name does not exist.', async () => {
        const notification = {
            name: 'foo',
            data: {}
        };
        await assertthat_1.assert.that(async () => {
            await executeNotificationSubscribers_1.executeNotificationSubscribers({
                application,
                viewName: 'non-existent',
                notification,
                services: {
                    logger: loggerService,
                    notification: notificationService
                }
            });
        }).is.throwingAsync((ex) => ex.code === errors_1.errors.ViewNotFound.code &&
            ex.message === `View 'non-existent' not found.`);
    });
    test('executes the relevant subscribers and publishes their notifications.', async () => {
        const notification = {
            name: 'flowSampleFlowUpdated',
            data: {}
        };
        await executeNotificationSubscribers_1.executeNotificationSubscribers({
            application,
            viewName: 'sampleView',
            notification,
            services: {
                logger: loggerService,
                notification: notificationService
            }
        });
        assertthat_1.assert.that(notifications.length).is.equalTo(1);
        assertthat_1.assert.that(notifications[0]).is.equalTo({
            name: 'viewSampleViewUpdated',
            data: {},
            metadata: undefined
        });
    });
    test('does nothing if the notification is not relevant to any subscriber.', async () => {
        const notification = {
            name: 'irrelevant',
            data: {}
        };
        await executeNotificationSubscribers_1.executeNotificationSubscribers({
            application,
            viewName: 'sampleView',
            notification,
            services: {
                logger: loggerService,
                notification: notificationService
            }
        });
        assertthat_1.assert.that(notifications.length).is.equalTo(0);
    });
    test('does nothing if there are no notification subscribers.', async () => {
        const applicationWithoutNotificationSubscribers = {
            ...application,
            views: {
                sampleView: {
                    ...application.views.sampleView,
                    notificationSubscribers: undefined
                }
            }
        };
        const notification = {
            name: 'flowSampleFlowUpdated',
            data: {}
        };
        await executeNotificationSubscribers_1.executeNotificationSubscribers({
            application: applicationWithoutNotificationSubscribers,
            viewName: 'sampleView',
            notification,
            services: {
                logger: loggerService,
                notification: notificationService
            }
        });
        assertthat_1.assert.that(notifications.length).is.equalTo(0);
    });
});
//# sourceMappingURL=executeNotificationSubscribersTests.js.map