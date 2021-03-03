"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDomainEventAuthorized = void 0;
const lodash_1 = require("lodash");
const errors_1 = require("../../errors");
const isDomainEventAuthorized = async function ({ domainEventWithState, aggregateState, domainEventHandler, services }) {
    const clonedDomainEvent = lodash_1.cloneDeep(domainEventWithState);
    const isAuthorized = await domainEventHandler.isAuthorized(aggregateState, clonedDomainEvent, services);
    if (!isAuthorized) {
        throw new errors_1.errors.DomainEventNotAuthorized();
    }
};
exports.isDomainEventAuthorized = isDomainEventAuthorized;
//# sourceMappingURL=isDomainEventAuthorized.js.map