"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateItemIdentifier = void 0;
const errors_1 = require("../errors");
const validateItemIdentifier = function ({ itemIdentifier, application, itemType }) {
    const contextDefinitions = application.domain;
    const { aggregateIdentifier: { context: { name: contextName }, aggregate: { name: aggregateName } }, name } = itemIdentifier;
    if (!(contextName in contextDefinitions)) {
        throw new errors_1.errors.ContextNotFound(`Context '${contextName}' not found.`);
    }
    if (!(aggregateName in contextDefinitions[contextName])) {
        throw new errors_1.errors.AggregateNotFound(`Aggregate '${contextName}.${aggregateName}' not found.`);
    }
    switch (itemType) {
        case 'command': {
            if (!(name in contextDefinitions[contextName][aggregateName].commandHandlers)) {
                throw new errors_1.errors.CommandNotFound(`Command '${contextName}.${aggregateName}.${name}' not found.`);
            }
            break;
        }
        case 'domain-event': {
            if (!(name in contextDefinitions[contextName][aggregateName].domainEventHandlers)) {
                throw new errors_1.errors.DomainEventNotFound(`Domain event '${contextName}.${aggregateName}.${name}' not found.`);
            }
            break;
        }
        default: {
            break;
        }
    }
};
exports.validateItemIdentifier = validateItemIdentifier;
//# sourceMappingURL=validateItemIdentifier.js.map