"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPublisher = void 0;
const errors_1 = require("../../common/errors");
const HttpPublisher_1 = require("./Http/HttpPublisher");
const InMemoryPublisher_1 = require("./InMemory/InMemoryPublisher");
const createPublisher = async function (options) {
    switch (options.type) {
        case 'InMemory': {
            return await InMemoryPublisher_1.InMemoryPublisher.create(options);
        }
        case 'Http': {
            return await HttpPublisher_1.HttpPublisher.create(options);
        }
        default: {
            throw new errors_1.errors.PublisherTypeInvalid();
        }
    }
};
exports.createPublisher = createPublisher;
//# sourceMappingURL=createPublisher.js.map