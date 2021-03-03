"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReplayConfiguration = void 0;
const errors_1 = require("../../../common/errors");
const validate_value_1 = require("validate-value");
const validateReplayConfiguration = function ({ application, replayConfiguration }) {
    const value = new validate_value_1.Value({
        type: 'object',
        properties: {
            flows: {
                type: 'array',
                items: { type: 'string', minLength: 1 }
            },
            contexts: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        contextName: { type: 'string' },
                        aggregates: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    aggregateName: { type: 'string' },
                                    instances: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                aggregateId: { type: 'string', format: 'uuid' },
                                                from: { type: 'number', minimum: 1 },
                                                to: { type: 'number', minimum: 1 }
                                            },
                                            required: ['aggregateId'],
                                            additionalProperties: false
                                        }
                                    }
                                },
                                required: ['aggregateName'],
                                additionalProperties: false
                            }
                        }
                    },
                    required: ['contextName'],
                    additionalProperties: false
                }
            }
        },
        required: [],
        additionalProperties: false
    });
    try {
        value.validate(replayConfiguration, { valueName: 'replayConfiguration' });
    }
    catch (ex) {
        throw new errors_1.errors.ReplayConfigurationInvalid(undefined, { cause: ex });
    }
    const typeSafeReplayConfiguration = replayConfiguration;
    if (typeSafeReplayConfiguration.flows) {
        for (const flowName of typeSafeReplayConfiguration.flows) {
            if (!(flowName in application.flows)) {
                throw new errors_1.errors.ReplayConfigurationInvalid(`Flow '${flowName}' not found.`);
            }
        }
    }
    if (typeSafeReplayConfiguration.contexts) {
        const seenContextNames = new Set();
        for (const context of typeSafeReplayConfiguration.contexts) {
            if (!(context.contextName in application.domain)) {
                throw new errors_1.errors.ReplayConfigurationInvalid(`Context '${context.contextName}' not found.`);
            }
            if (seenContextNames.has(context.contextName)) {
                throw new errors_1.errors.ReplayConfigurationInvalid(`Context '${context.contextName}' is duplicated.`);
            }
            seenContextNames.add(context.contextName);
            if (context.aggregates) {
                const seenAggregateNames = new Set();
                for (const aggregate of context.aggregates) {
                    if (!(aggregate.aggregateName in application.domain[context.contextName])) {
                        throw new errors_1.errors.ReplayConfigurationInvalid(`Aggregate '${context.contextName}.${aggregate.aggregateName}' not found.`);
                    }
                    if (seenAggregateNames.has(aggregate.aggregateName)) {
                        throw new errors_1.errors.ReplayConfigurationInvalid(`Aggregate '${context.contextName}.${aggregate.aggregateName}' is duplicated.`);
                    }
                    seenAggregateNames.add(aggregate.aggregateName);
                    if (aggregate.instances) {
                        const seenInstanceIds = new Set();
                        for (const instance of aggregate.instances) {
                            if (seenInstanceIds.has(instance.aggregateId)) {
                                throw new errors_1.errors.ReplayConfigurationInvalid(`Aggregate instance '${context.contextName}.${aggregate.aggregateName}.${instance.aggregateId}' is duplicated.`);
                            }
                            seenInstanceIds.add(instance.aggregateId);
                            if (instance.from && instance.to && instance.from > instance.to) {
                                throw new errors_1.errors.ReplayConfigurationInvalid(`Can not replay from ${instance.from} to ${instance.to} for aggregate '${context.contextName}.${aggregate.aggregateName}'.`);
                            }
                        }
                    }
                }
            }
        }
    }
};
exports.validateReplayConfiguration = validateReplayConfiguration;
//# sourceMappingURL=validateReplayConfiguration.js.map