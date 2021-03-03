"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCommand = void 0;
const acknowledgeCommand_1 = require("./acknowledgeCommand");
const errors_1 = require("../../../../common/errors");
const fetchCommand_1 = require("./fetchCommand");
const flaschenpost_1 = require("flaschenpost");
const getCommandWithMetadataSchema_1 = require("../../../../common/schemas/getCommandWithMetadataSchema");
const keepRenewingLock_1 = require("./keepRenewingLock");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const processCommand = async function ({ commandDispatcher, repository, publishDomainEvents }) {
    const { command, metadata } = await fetchCommand_1.fetchCommand({ commandDispatcher });
    logger.debug('Fetched and locked command for domain server.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/domain', { itemIdentifier: command.getItemIdentifier(), metadata }));
    try {
        try {
            new validate_value_1.Value(getCommandWithMetadataSchema_1.getCommandWithMetadataSchema()).validate(command, { valueName: 'command' });
        }
        catch (ex) {
            throw new errors_1.errors.CommandMalformed(ex.message);
        }
        const aggregateInstance = await repository.getAggregateInstance({
            aggregateIdentifier: command.aggregateIdentifier
        });
        const handleCommandPromise = aggregateInstance.handleCommand({ command });
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
            await keepRenewingLock_1.keepRenewingLock({ command, handleCommandPromise, commandDispatcher, token: metadata.token });
        })();
        const domainEvents = await handleCommandPromise;
        await publishDomainEvents({ domainEvents });
    }
    catch (ex) {
        logger.error('Failed to handle command.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/domain', { command, error: ex }));
    }
    finally {
        await acknowledgeCommand_1.acknowledgeCommand({ command, token: metadata.token, commandDispatcher });
        logger.debug('Processed and acknowledged command.', withLogMetadata_1.withLogMetadata('runtime', 'microservice/domain', { itemIdentifier: command.getItemIdentifier(), metadata }));
    }
};
exports.processCommand = processCommand;
//# sourceMappingURL=processCommand.js.map