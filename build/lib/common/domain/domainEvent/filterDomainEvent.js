"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterDomainEvent = void 0;
const lodash_1 = require("lodash");
const errors_1 = require("../../errors");
const filterDomainEvent = async function ({ domainEventWithState, aggregateState, domainEventHandler, services }) {
    /* eslint-disable @typescript-eslint/unbound-method */
    if (!domainEventHandler.filter) {
        return;
    }
    /* eslint-enable @typescript-eslint/unbound-method */
    const clonedDomainEvent = lodash_1.cloneDeep(domainEventWithState);
    const keepDomainEvent = await domainEventHandler.filter(aggregateState, clonedDomainEvent, services);
    if (!keepDomainEvent) {
        throw new errors_1.errors.DomainEventRejected();
    }
};
exports.filterDomainEvent = filterDomainEvent;
//# sourceMappingURL=filterDomainEvent.js.map