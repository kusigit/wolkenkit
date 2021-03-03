"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDomainEvent = void 0;
const acknowledgeDomainEvent_1 = require("./acknowledgeDomainEvent");
const errors_1 = require("../../../../../common/errors");
const executeFlow_1 = require("../../../../../common/domain/executeFlow");
const fetchDomainEvent_1 = require("./fetchDomainEvent");
const flaschenpost_1 = require("flaschenpost");
const getAggregatesService_1 = require("../../../../../common/services/getAggregatesService");
const getCommandService_1 = require("../../../../../common/services/getCommandService");
const getDomainEventSchema_1 = require("../../../../../common/schemas/getDomainEventSchema");
const getLockService_1 = require("../../../../../common/services/getLockService");
const getLoggerService_1 = require("../../../../../common/services/getLoggerService");
const getNotificationService_1 = require("../../../../../common/services/getNotificationService");
const keepRenewingLock_1 = require("./keepRenewingLock");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const processDomainEvent = async function ({ application, priorityQueue, consumerProgressStore, lockStore, repository, issueCommand, performReplay }) {
    const { domainEvent, metadata } = await fetchDomainEvent_1.fetchDomainEvent({ priorityQueue });
    const flowName = metadata.discriminator;
    logger.debug('Fetched and locked domain event for flow execution.', withLogMetadata_1.withLogMetadata('runtime', 'singleProcess/main', { itemIdentifier: domainEvent.getItemIdentifier(), metadata }));
    try {
        try {
            new validate_value_1.Value(getDomainEventSchema_1.getDomainEventSchema()).validate(domainEvent, { valueName: 'domainEvent' });
        }
        catch (ex) {
            throw new errors_1.errors.DomainEventMalformed(ex.message);
        }
        if (!(flowName in application.flows)) {
            throw new errors_1.errors.FlowNotFound(`Received a domain event for unknown flow '${flowName}'.`);
        }
        const flowPromise = executeFlow_1.executeFlow({
            application,
            domainEvent,
            flowName,
            flowProgressStore: consumerProgressStore,
            services: {
                aggregates: getAggregatesService_1.getAggregatesService({ repository }),
                command: getCommandService_1.getCommandService({ domainEvent, issueCommand }),
                infrastructure: application.infrastructure,
                logger: getLoggerService_1.getLoggerService({
                    fileName: `<app>/server/flows/${flowName}`,
                    packageManifest: application.packageManifest
                }),
                lock: getLockService_1.getLockService({ lockStore }),
                notification: getNotificationService_1.getNotificationService({
                    application,
                    publisher: repository.publisher,
                    channel: repository.pubSubChannelForNotifications
                })
            },
            performReplay
        });
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
            await keepRenewingLock_1.keepRenewingLock({ flowName, flowPromise, priorityQueue, token: metadata.token });
        })();
        const howToProceed = await flowPromise;
        switch (howToProceed) {
            case 'acknowledge': {
                await acknowledgeDomainEvent_1.acknowledgeDomainEvent({ flowName, token: metadata.token, priorityQueue });
                logger.debug('Acknowledged domain event.', withLogMetadata_1.withLogMetadata('runtime', 'singleProcess/main', { itemIdentifier: domainEvent.getItemIdentifier(), metadata }));
                break;
            }
            case 'defer': {
                await priorityQueue.store.defer({
                    discriminator: flowName,
                    priority: domainEvent.metadata.timestamp,
                    token: metadata.token
                });
                logger.debug('Skipped and deferred domain event.', withLogMetadata_1.withLogMetadata('runtime', 'singleProcess/main', { itemIdentifier: domainEvent.getItemIdentifier(), metadata }));
                break;
            }
            default: {
                throw new errors_1.errors.InvalidOperation();
            }
        }
    }
    catch (ex) {
        logger.error('Failed to handle domain event.', withLogMetadata_1.withLogMetadata('runtime', 'singleProcess/main', { domainEvent, error: ex }));
        await acknowledgeDomainEvent_1.acknowledgeDomainEvent({ flowName, token: metadata.token, priorityQueue });
    }
};
exports.processDomainEvent = processDomainEvent;
//# sourceMappingURL=processDomainEvent.js.map