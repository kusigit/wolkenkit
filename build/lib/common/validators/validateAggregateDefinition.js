"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAggregateDefinition = void 0;
const errors_1 = require("../errors");
const validateCommandHandler_1 = require("./validateCommandHandler");
const validateDomainEventHandler_1 = require("./validateDomainEventHandler");
const lodash_1 = require("lodash");
const validateAggregateDefinition = function ({ aggregateDefinition }) {
    if (lodash_1.isUndefined(aggregateDefinition.getInitialState)) {
        throw new errors_1.errors.AggregateDefinitionMalformed(`Function 'getInitialState' is missing.`);
    }
    if (!lodash_1.isFunction(aggregateDefinition.getInitialState)) {
        throw new errors_1.errors.AggregateDefinitionMalformed(`Property 'getInitialState' is not a function.`);
    }
    if (lodash_1.isUndefined(aggregateDefinition.commandHandlers)) {
        throw new errors_1.errors.AggregateDefinitionMalformed(`Object 'commandHandlers' is missing.`);
    }
    if (!lodash_1.isObject(aggregateDefinition.commandHandlers)) {
        throw new errors_1.errors.AggregateDefinitionMalformed(`Property 'commandHandlers' is not an object.`);
    }
    for (const [commandHandlerName, commandHandler] of Object.entries(aggregateDefinition.commandHandlers)) {
        try {
            validateCommandHandler_1.validateCommandHandler({ commandHandler });
        }
        catch (ex) {
            throw new errors_1.errors.AggregateDefinitionMalformed(`Command handler '${commandHandlerName}' is malformed: ${ex.message}`);
        }
    }
    if (lodash_1.isUndefined(aggregateDefinition.domainEventHandlers)) {
        throw new errors_1.errors.AggregateDefinitionMalformed(`Object 'domainEventHandlers' is missing.`);
    }
    if (!lodash_1.isObject(aggregateDefinition.domainEventHandlers)) {
        throw new errors_1.errors.AggregateDefinitionMalformed(`Property 'domainEventHandlers' is not an object.`);
    }
    for (const [domainEventHandlerName, domainEventHandler] of Object.entries(aggregateDefinition.domainEventHandlers)) {
        try {
            validateDomainEventHandler_1.validateDomainEventHandler({ domainEventHandler });
        }
        catch (ex) {
            throw new errors_1.errors.AggregateDefinitionMalformed(`Domain event handler '${domainEventHandlerName}' is malformed: ${ex.message}`);
        }
    }
    if (!lodash_1.isUndefined(aggregateDefinition.enhancers)) {
        if (!lodash_1.isArray(aggregateDefinition.enhancers)) {
            throw new errors_1.errors.AggregateDefinitionMalformed(`Property 'enhancers' is not an array.`);
        }
        for (const [index, enhancer] of aggregateDefinition.enhancers.entries()) {
            if (!lodash_1.isFunction(enhancer)) {
                throw new errors_1.errors.AggregateDefinitionMalformed(`Aggregate enhancer at index ${index} is not a function.`);
            }
        }
    }
};
exports.validateAggregateDefinition = validateAggregateDefinition;
//# sourceMappingURL=validateAggregateDefinition.js.map