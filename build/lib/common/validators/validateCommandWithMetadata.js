"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommandWithMetadata = void 0;
const errors_1 = require("../errors");
const validate_value_1 = require("validate-value");
const validateCommandWithMetadata = function ({ command, application }) {
    const contextDefinitions = application.domain;
    const { aggregateIdentifier: { context: { name: contextName }, aggregate: { name: aggregateName } }, name: commandName, data: commandData } = command;
    if (!(contextName in contextDefinitions)) {
        throw new errors_1.errors.ContextNotFound(`Context '${contextName}' not found.`);
    }
    if (!(aggregateName in contextDefinitions[contextName])) {
        throw new errors_1.errors.AggregateNotFound(`Aggregate '${contextName}.${aggregateName}' not found.`);
    }
    if (!(commandName in contextDefinitions[contextName][aggregateName].commandHandlers)) {
        throw new errors_1.errors.CommandNotFound(`Command '${contextName}.${aggregateName}.${commandName}' not found.`);
    }
    const commandHandler = contextDefinitions[contextName][aggregateName].commandHandlers[commandName];
    if (!commandHandler.getSchema) {
        return;
    }
    const schemaData = new validate_value_1.Value(commandHandler.getSchema());
    try {
        schemaData.validate(commandData, { valueName: 'command.data' });
    }
    catch (ex) {
        throw new errors_1.errors.CommandMalformed(ex.message, { cause: ex });
    }
};
exports.validateCommandWithMetadata = validateCommandWithMetadata;
//# sourceMappingURL=validateCommandWithMetadata.js.map