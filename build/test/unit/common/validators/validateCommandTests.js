"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const Command_1 = require("../../../../lib/common/elements/Command");
const errors_1 = require("../../../../lib/common/errors");
const getTestApplicationDirectory_1 = require("../../../shared/applications/getTestApplicationDirectory");
const loadApplication_1 = require("../../../../lib/common/application/loadApplication");
const uuid_1 = require("uuid");
const validateCommand_1 = require("../../../../lib/common/validators/validateCommand");
suite('validateCommand', () => {
    const applicationDirectory = getTestApplicationDirectory_1.getTestApplicationDirectory({ name: 'base' });
    const command = new Command_1.Command({
        aggregateIdentifier: {
            context: { name: 'sampleContext' },
            aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
        },
        name: 'execute',
        data: {
            strategy: 'succeed'
        }
    });
    let application;
    suiteSetup(async () => {
        application = await loadApplication_1.loadApplication({ applicationDirectory });
    });
    test('does not throw an error if everything is fine.', async () => {
        assertthat_1.assert.that(() => {
            validateCommand_1.validateCommand({ command, application });
        }).is.not.throwing();
    });
    test(`throws an error if the command's context doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateCommand_1.validateCommand({
                command: {
                    ...command,
                    aggregateIdentifier: {
                        context: { name: 'someContext' },
                        aggregate: command.aggregateIdentifier.aggregate
                    }
                },
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.ContextNotFound.code &&
            ex.message === `Context 'someContext' not found.`);
    });
    test(`throws an error if the command's aggregate doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateCommand_1.validateCommand({
                command: {
                    ...command,
                    aggregateIdentifier: {
                        context: command.aggregateIdentifier.context,
                        aggregate: {
                            name: 'someAggregate',
                            id: uuid_1.v4()
                        }
                    }
                },
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.AggregateNotFound.code &&
            ex.message === `Aggregate 'sampleContext.someAggregate' not found.`);
    });
    test(`throws an error if the command doesn't exist in the application definition.`, async () => {
        assertthat_1.assert.that(() => {
            validateCommand_1.validateCommand({
                command: {
                    ...command,
                    name: 'someCommand'
                },
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.CommandNotFound.code &&
            ex.message === `Command 'sampleContext.sampleAggregate.someCommand' not found.`);
    });
    test(`throws an error if the command's data doesn't match its schema.`, async () => {
        assertthat_1.assert.that(() => {
            validateCommand_1.validateCommand({
                command: {
                    ...command,
                    data: {
                        foo: ''
                    }
                },
                application
            });
        }).is.throwing((ex) => ex.code === errors_1.errors.CommandMalformed.code &&
            ex.message === `Missing required property: strategy (at command.data.strategy).`);
    });
});
//# sourceMappingURL=validateCommandTests.js.map