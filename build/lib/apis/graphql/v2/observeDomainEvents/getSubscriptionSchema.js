"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionSchema = void 0;
const errors_1 = require("../../../../common/errors");
const getDomainEventsFieldConfiguration_1 = require("./getDomainEventsFieldConfiguration");
const getDomainEventWithStateSchema_1 = require("../../../../common/schemas/getDomainEventWithStateSchema");
const SpecializedEventEmitter_1 = require("../../../../common/utils/events/SpecializedEventEmitter");
const validateDomainEventWithState_1 = require("../../../../common/validators/validateDomainEventWithState");
const validate_value_1 = require("validate-value");
const domainEventWithStateSchema = new validate_value_1.Value(getDomainEventWithStateSchema_1.getDomainEventWithStateSchema());
const getSubscriptionSchema = function ({ application, repository }) {
    const domainEventEmitter = new SpecializedEventEmitter_1.SpecializedEventEmitter();
    const publishDomainEvent = function ({ domainEvent }) {
        try {
            domainEventWithStateSchema.validate(domainEvent, { valueName: 'domainEvent' });
        }
        catch (ex) {
            throw new errors_1.errors.DomainEventMalformed(ex.message);
        }
        validateDomainEventWithState_1.validateDomainEventWithState({ domainEvent, application });
        domainEventEmitter.emit(domainEvent);
    };
    const schema = getDomainEventsFieldConfiguration_1.getDomainEventsFieldConfiguration({
        application,
        repository,
        domainEventEmitter
    });
    return {
        schema,
        publishDomainEvent
    };
};
exports.getSubscriptionSchema = getSubscriptionSchema;
//# sourceMappingURL=getSubscriptionSchema.js.map