"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAggregatesService = void 0;
const errors_1 = require("../errors");
const getAggregatesService = function ({ repository }) {
    return {
        async read({ aggregateIdentifier }) {
            const otherAggregateInstance = await repository.getAggregateInstance({
                aggregateIdentifier
            });
            if (otherAggregateInstance.isPristine()) {
                throw new errors_1.errors.AggregateNotFound(`Aggregate '${aggregateIdentifier.context.name}.${aggregateIdentifier.aggregate.name}.${aggregateIdentifier.aggregate.id}' not found.`);
            }
            return otherAggregateInstance.state;
        }
    };
};
exports.getAggregatesService = getAggregatesService;
//# sourceMappingURL=getAggregatesService.js.map