"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscriber = void 0;
const errors_1 = require("../../common/errors");
const HttpSubscriber_1 = require("./Http/HttpSubscriber");
const InMemorySubscriber_1 = require("./InMemory/InMemorySubscriber");
const createSubscriber = async function (options) {
    switch (options.type) {
        case 'InMemory': {
            return await InMemorySubscriber_1.InMemorySubscriber.create(options);
        }
        case 'Http': {
            return await HttpSubscriber_1.HttpSubscriber.create(options);
        }
        default: {
            throw new errors_1.errors.SubscriberTypeInvalid();
        }
    }
};
exports.createSubscriber = createSubscriber;
//# sourceMappingURL=createSubscriber.js.map