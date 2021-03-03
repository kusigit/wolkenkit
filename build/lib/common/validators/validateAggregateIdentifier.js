"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAggregateIdentifier = void 0;
const errors_1 = require("../errors");
const validateAggregateIdentifier = function ({ aggregateIdentifier, application }) {
    const contextDefinitions = application.domain;
    if (!(aggregateIdentifier.context.name in contextDefinitions)) {
        throw new errors_1.errors.ContextNotFound(`Context '${aggregateIdentifier.context.name}' not found.`);
    }
    if (!(aggregateIdentifier.aggregate.name in contextDefinitions[aggregateIdentifier.context.name])) {
        throw new errors_1.errors.AggregateNotFound(`Aggregate '${aggregateIdentifier.context.name}.${aggregateIdentifier.aggregate.name}' not found.`);
    }
};
exports.validateAggregateIdentifier = validateAggregateIdentifier;
//# sourceMappingURL=validateAggregateIdentifier.js.map