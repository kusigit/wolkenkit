"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getV2 = void 0;
const errors_1 = require("../../../../common/errors");
const getApiBase_1 = require("../../../base/getApiBase");
const getAuthenticationMiddleware_1 = require("../../../base/getAuthenticationMiddleware");
const getDescription_1 = require("./getDescription");
const getDomainEvents_1 = require("./getDomainEvents");
const getDomainEventWithStateSchema_1 = require("../../../../common/schemas/getDomainEventWithStateSchema");
const flaschenpost_1 = require("flaschenpost");
const SpecializedEventEmitter_1 = require("../../../../common/utils/events/SpecializedEventEmitter");
const validateDomainEventWithState_1 = require("../../../../common/validators/validateDomainEventWithState");
const validate_value_1 = require("validate-value");
const domainEventWithStateSchema = new validate_value_1.Value(getDomainEventWithStateSchema_1.getDomainEventWithStateSchema());
const getV2 = async function ({ corsOrigin, application, repository, identityProviders, heartbeatInterval }) {
    const api = await getApiBase_1.getApiBase({
        request: {
            headers: { cors: { origin: corsOrigin } },
            body: { parser: false },
            query: { parser: { useJson: true } }
        },
        response: {
            headers: { cache: false }
        }
    });
    const authenticationMiddleware = await getAuthenticationMiddleware_1.getAuthenticationMiddleware({
        identityProviders
    });
    const domainEventEmitter = new SpecializedEventEmitter_1.SpecializedEventEmitter();
    api.get(`/${getDescription_1.getDescription.path}`, flaschenpost_1.getMiddleware(), getDescription_1.getDescription.getHandler({
        application
    }));
    api.get(`/${getDomainEvents_1.getDomainEvents.path}`, flaschenpost_1.getMiddleware({ logOn: 'request' }), authenticationMiddleware, getDomainEvents_1.getDomainEvents.getHandler({
        application,
        domainEventEmitter,
        repository,
        heartbeatInterval
    }));
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
    return { api, publishDomainEvent };
};
exports.getV2 = getV2;
//# sourceMappingURL=index.js.map