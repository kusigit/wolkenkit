#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Aeonstore_1 = require("../../../../stores/domainEventStore/Aeonstore");
const Client_1 = require("../../../../apis/handleCommandWithMetadata/http/v2/Client");
const configurationDefinition_1 = require("./configurationDefinition");
const createLockStore_1 = require("../../../../stores/lockStore/createLockStore");
const createPublisher_1 = require("../../../../messaging/pubSub/createPublisher");
const createSubscriber_1 = require("../../../../messaging/pubSub/createSubscriber");
const DomainEventWithState_1 = require("../../../../common/elements/DomainEventWithState");
const flaschenpost_1 = require("flaschenpost");
const fromEnvironmentVariables_1 = require("../../../shared/fromEnvironmentVariables");
const getApi_1 = require("./getApi");
const getDomainEventWithStateSchema_1 = require("../../../../common/schemas/getDomainEventWithStateSchema");
const getIdentityProviders_1 = require("../../../shared/getIdentityProviders");
const getOnCancelCommand_1 = require("./getOnCancelCommand");
const getOnReceiveCommand_1 = require("./getOnReceiveCommand");
const getSnapshotStrategy_1 = require("../../../../common/domain/getSnapshotStrategy");
const http_1 = __importDefault(require("http"));
const loadApplication_1 = require("../../../../common/application/loadApplication");
const registerExceptionHandler_1 = require("../../../../common/utils/process/registerExceptionHandler");
const Repository_1 = require("../../../../common/domain/Repository");
const runHealthServer_1 = require("../../../shared/runHealthServer");
const validateDomainEventWithState_1 = require("../../../../common/validators/validateDomainEventWithState");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
/* eslint-disable @typescript-eslint/no-floating-promises */
(async () => {
    const logger = flaschenpost_1.flaschenpost.getLogger();
    try {
        registerExceptionHandler_1.registerExceptionHandler();
        const configuration = await fromEnvironmentVariables_1.fromEnvironmentVariables({ configurationDefinition: configurationDefinition_1.configurationDefinition });
        logger.info('Starting graphql server...', withLogMetadata_1.withLogMetadata('runtime', 'microservice/graphql'));
        const identityProviders = await getIdentityProviders_1.getIdentityProviders({
            identityProvidersEnvironmentVariable: configuration.identityProviders
        });
        const application = await loadApplication_1.loadApplication({
            applicationDirectory: configuration.applicationDirectory
        });
        const domainEventStore = await Aeonstore_1.AeonstoreDomainEventStore.create({
            protocol: configuration.aeonstoreProtocol,
            hostName: configuration.aeonstoreHostName,
            portOrSocket: configuration.aeonstorePortOrSocket
        });
        const publisher = await createPublisher_1.createPublisher(configuration.pubSubOptions.publisher);
        const subscriber = await createSubscriber_1.createSubscriber(configuration.pubSubOptions.subscriber);
        const repository = new Repository_1.Repository({
            application,
            lockStore: await createLockStore_1.createLockStore({ type: 'InMemory' }),
            domainEventStore,
            snapshotStrategy: getSnapshotStrategy_1.getSnapshotStrategy(configuration.snapshotStrategy),
            publisher,
            pubSubChannelForNotifications: configuration.pubSubOptions.channelForNotifications
        });
        const commandDispatcherClient = new Client_1.Client({
            protocol: configuration.commandDispatcherProtocol,
            hostName: configuration.commandDispatcherHostName,
            portOrSocket: configuration.commandDispatcherPortOrSocket,
            path: '/handle-command/v2'
        });
        const commandDispatcher = {
            client: commandDispatcherClient,
            retries: configuration.commandDispatcherRetries
        };
        const onReceiveCommand = getOnReceiveCommand_1.getOnReceiveCommand({ commandDispatcher });
        const onCancelCommand = getOnCancelCommand_1.getOnCancelCommand({ commandDispatcher });
        const { api, publishDomainEvent, initializeGraphQlOnServer } = await getApi_1.getApi({
            configuration,
            application,
            identityProviders,
            onReceiveCommand,
            onCancelCommand,
            repository,
            subscriber,
            channelForNotifications: configuration.pubSubOptions.channelForNotifications
        });
        const server = http_1.default.createServer(api);
        await (initializeGraphQlOnServer === null || initializeGraphQlOnServer === void 0 ? void 0 : initializeGraphQlOnServer({ server }));
        await runHealthServer_1.runHealthServer({
            corsOrigin: configuration.corsOrigin,
            portOrSocket: configuration.healthPortOrSocket
        });
        await new Promise((resolve) => {
            server.listen(configuration.portOrSocket, () => {
                resolve();
            });
        });
        logger.info('Started GraphQL server.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/graphql', {
            portOrSocket: configuration.portOrSocket,
            healthPortOrSocket: configuration.healthPortOrSocket
        }));
        await subscriber.subscribe({
            channel: configuration.pubSubOptions.channelForNewDomainEvents,
            async callback(rawDomainEvent) {
                const domainEvent = new DomainEventWithState_1.DomainEventWithState(rawDomainEvent);
                try {
                    new validate_value_1.Value(getDomainEventWithStateSchema_1.getDomainEventWithStateSchema()).validate(domainEvent, { valueName: 'domainEvent' });
                    validateDomainEventWithState_1.validateDomainEventWithState({ domainEvent, application });
                }
                catch (ex) {
                    logger.error('Received a message with an unexpected format from the publisher.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/graphql', { domainEvent, error: ex }));
                    return;
                }
                publishDomainEvent({ domainEvent });
            }
        });
    }
    catch (ex) {
        logger.fatal('An unexpected error occured.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/graphql', { error: ex }));
        process.exit(1);
    }
})();
/* eslint-enable @typescript-eslint/no-floating-promises */
//# sourceMappingURL=app.js.map