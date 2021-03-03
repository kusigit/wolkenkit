"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAggregateService = void 0;
const DomainEvent_1 = require("../elements/DomainEvent");
const DomainEventWithState_1 = require("../elements/DomainEventWithState");
const errors_1 = require("../errors");
const uuid_1 = require("uuid");
const validate_value_1 = require("validate-value");
const lodash_1 = require("lodash");
const getAggregateService = function ({ aggregateInstance, application, command }) {
    return {
        id() {
            return aggregateInstance.aggregateIdentifier.aggregate.id;
        },
        isPristine() {
            return aggregateInstance.isPristine();
        },
        publishDomainEvent(domainEventName, data, 
        // eslint-disable-next-line unicorn/no-object-as-default-parameter
        metadata = { tags: [] }) {
            const contextName = aggregateInstance.aggregateIdentifier.context.name;
            const aggregateName = aggregateInstance.aggregateIdentifier.aggregate.name;
            const domainEventHandler = lodash_1.get(application.domain, [contextName, aggregateName, 'domainEventHandlers', domainEventName]);
            if (!domainEventHandler) {
                throw new errors_1.errors.DomainEventUnknown(`Failed to publish unknown domain event '${domainEventName}' in '${contextName}.${aggregateName}'.`);
            }
            if (domainEventHandler.getSchema) {
                const schema = domainEventHandler.getSchema();
                const value = new validate_value_1.Value(schema);
                value.validate(data, { valueName: 'data' });
            }
            const domainEvent = new DomainEvent_1.DomainEvent({
                aggregateIdentifier: aggregateInstance.aggregateIdentifier,
                name: domainEventName,
                data,
                id: uuid_1.v4(),
                metadata: {
                    causationId: command.id,
                    correlationId: command.metadata.correlationId,
                    timestamp: Date.now(),
                    initiator: command.metadata.initiator,
                    revision: aggregateInstance.revision + aggregateInstance.unstoredDomainEvents.length + 1,
                    tags: metadata.tags
                }
            });
            const previousState = lodash_1.cloneDeep(aggregateInstance.state);
            const nextState = aggregateInstance.applyDomainEvent({ application, domainEvent });
            const domainEventWithState = new DomainEventWithState_1.DomainEventWithState({
                ...domainEvent,
                state: {
                    previous: previousState,
                    next: nextState
                }
            });
            aggregateInstance.unstoredDomainEvents.push(domainEventWithState);
            return nextState;
        }
    };
};
exports.getAggregateService = getAggregateService;
//# sourceMappingURL=getAggregateService.js.map