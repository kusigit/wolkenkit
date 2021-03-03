"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDomainEventWithState = void 0;
const errors_1 = require("../errors");
const validate_value_1 = require("validate-value");
const validateDomainEventWithState = function ({ domainEvent, application }) {
    const contextDefinitions = application.domain;
    const { aggregateIdentifier: { context: { name: contextName }, aggregate: { name: aggregateName } }, name: domainEventName, data: domainEventData } = domainEvent;
    if (!(contextName in contextDefinitions)) {
        throw new errors_1.errors.ContextNotFound(`Context '${contextName}' not found.`);
    }
    if (!(aggregateName in contextDefinitions[contextName])) {
        throw new errors_1.errors.AggregateNotFound(`Aggregate '${contextName}.${aggregateName}' not found.`);
    }
    if (!(domainEventName in contextDefinitions[contextName][aggregateName].domainEventHandlers)) {
        throw new errors_1.errors.DomainEventNotFound(`Domain event '${contextName}.${aggregateName}.${domainEventName}' not found.`);
    }
    const domainEventHandler = contextDefinitions[contextName][aggregateName].domainEventHandlers[domainEventName];
    if (!domainEventHandler.getSchema) {
        return;
    }
    const schemaData = new validate_value_1.Value(domainEventHandler.getSchema());
    try {
        schemaData.validate(domainEventData, { valueName: 'domainEvent.data' });
    }
    catch (ex) {
        throw new errors_1.errors.DomainEventMalformed(ex.message, { cause: ex });
    }
};
exports.validateDomainEventWithState = validateDomainEventWithState;
//# sourceMappingURL=validateDomainEventWithState.js.map