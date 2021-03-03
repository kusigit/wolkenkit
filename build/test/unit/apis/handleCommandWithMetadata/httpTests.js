"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const CommandWithMetadata_1 = require("../../../../lib/common/elements/CommandWithMetadata");
const errors_1 = require("../../../../lib/common/errors");
const http_1 = require("../../../../lib/apis/handleCommandWithMetadata/http");
const getTestApplicationDirectory_1 = require("../../../shared/applications/getTestApplicationDirectory");
const loadApplication_1 = require("../../../../lib/common/application/loadApplication");
const runAsServer_1 = require("../../../shared/http/runAsServer");
const uuid_1 = require("uuid");
suite('handleCommandWithMetadata/http', () => {
    let application;
    suite('/v2', () => {
        suiteSetup(async () => {
            const applicationDirectory = getTestApplicationDirectory_1.getTestApplicationDirectory({ name: 'base' });
            application = await loadApplication_1.loadApplication({ applicationDirectory });
        });
        suite('POST /', () => {
            let api, receivedCommands;
            setup(async () => {
                receivedCommands = [];
                ({ api } = await http_1.getApi({
                    corsOrigin: '*',
                    async onReceiveCommand({ command }) {
                        receivedCommands.push(command);
                    },
                    async onCancelCommand() {
                        // Intentionally left blank.
                    },
                    application
                }));
            });
            test('returns 415 if the content-type header is not set to application/json.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/',
                    headers: {
                        'content-type': 'text/plain'
                    },
                    data: 'foobar',
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(415);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.ContentTypeMismatch.code,
                    message: 'Header content-type must be application/json.'
                });
            });
            test('returns 400 if a malformed command is sent.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/',
                    data: {},
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(400);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.CommandMalformed.code,
                    message: 'Missing required property: aggregateIdentifier (at requestBody.aggregateIdentifier).'
                });
            });
            test('returns 400 if a wellformed command is sent with a non-existent context name.', async () => {
                const command = new CommandWithMetadata_1.CommandWithMetadata({
                    aggregateIdentifier: {
                        context: { name: 'nonExistent' },
                        aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                    },
                    name: 'execute',
                    data: { strategy: 'succeed' },
                    id: uuid_1.v4(),
                    metadata: {
                        causationId: uuid_1.v4(),
                        correlationId: uuid_1.v4(),
                        timestamp: Date.now(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        },
                        initiator: {
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } }
                        }
                    }
                });
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/',
                    data: command,
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(400);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.ContextNotFound.code,
                    message: `Context 'nonExistent' not found.`
                });
            });
            test('returns 400 if a wellformed command is sent with a non-existent aggregate name.', async () => {
                const command = new CommandWithMetadata_1.CommandWithMetadata({
                    aggregateIdentifier: {
                        context: { name: 'sampleContext' },
                        aggregate: { name: 'nonExistent', id: uuid_1.v4() }
                    },
                    name: 'execute',
                    data: { strategy: 'succeed' },
                    id: uuid_1.v4(),
                    metadata: {
                        causationId: uuid_1.v4(),
                        correlationId: uuid_1.v4(),
                        timestamp: Date.now(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        },
                        initiator: {
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } }
                        }
                    }
                });
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/',
                    data: command,
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(400);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.AggregateNotFound.code,
                    message: `Aggregate 'sampleContext.nonExistent' not found.`
                });
            });
            test('returns 400 if a wellformed command is sent with a non-existent command name.', async () => {
                const command = new CommandWithMetadata_1.CommandWithMetadata({
                    aggregateIdentifier: {
                        context: { name: 'sampleContext' },
                        aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                    },
                    name: 'nonExistent',
                    data: { strategy: 'succeed' },
                    id: uuid_1.v4(),
                    metadata: {
                        causationId: uuid_1.v4(),
                        correlationId: uuid_1.v4(),
                        timestamp: Date.now(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        },
                        initiator: {
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } }
                        }
                    }
                });
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/',
                    data: command,
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(400);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.CommandNotFound.code,
                    message: `Command 'sampleContext.sampleAggregate.nonExistent' not found.`
                });
            });
            test('returns 400 if a command is sent with a payload that does not match the schema.', async () => {
                const command = new CommandWithMetadata_1.CommandWithMetadata({
                    aggregateIdentifier: {
                        context: { name: 'sampleContext' },
                        aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                    },
                    name: 'execute',
                    data: { strategy: 'invalid-value' },
                    id: uuid_1.v4(),
                    metadata: {
                        causationId: uuid_1.v4(),
                        correlationId: uuid_1.v4(),
                        timestamp: Date.now(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        },
                        initiator: {
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } }
                        }
                    }
                });
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/',
                    data: command,
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(400);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.CommandMalformed.code,
                    message: 'No enum match (invalid-value), expects: succeed, fail, reject (at command.data.strategy).'
                });
            });
            test('returns 200 if a wellformed and existing command is sent.', async () => {
                const command = new CommandWithMetadata_1.CommandWithMetadata({
                    aggregateIdentifier: {
                        context: { name: 'sampleContext' },
                        aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                    },
                    name: 'execute',
                    data: { strategy: 'succeed' },
                    id: uuid_1.v4(),
                    metadata: {
                        causationId: uuid_1.v4(),
                        correlationId: uuid_1.v4(),
                        timestamp: Date.now(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        },
                        initiator: {
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } }
                        }
                    }
                });
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status } = await client({
                    method: 'post',
                    url: '/v2/',
                    data: command
                });
                assertthat_1.assert.that(status).is.equalTo(200);
            });
            test('receives commands.', async () => {
                const command = new CommandWithMetadata_1.CommandWithMetadata({
                    aggregateIdentifier: {
                        context: { name: 'sampleContext' },
                        aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                    },
                    name: 'execute',
                    data: { strategy: 'succeed' },
                    id: uuid_1.v4(),
                    metadata: {
                        causationId: uuid_1.v4(),
                        correlationId: uuid_1.v4(),
                        timestamp: Date.now(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        },
                        initiator: {
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } }
                        }
                    }
                });
                const { client } = await runAsServer_1.runAsServer({ app: api });
                await client({
                    method: 'post',
                    url: '/v2/',
                    data: command
                });
                assertthat_1.assert.that(receivedCommands.length).is.equalTo(1);
                assertthat_1.assert.that(receivedCommands[0]).is.equalTo(command);
            });
            test('returns the ID of the received command.', async () => {
                const command = new CommandWithMetadata_1.CommandWithMetadata({
                    aggregateIdentifier: {
                        context: { name: 'sampleContext' },
                        aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                    },
                    name: 'execute',
                    data: { strategy: 'succeed' },
                    id: uuid_1.v4(),
                    metadata: {
                        causationId: uuid_1.v4(),
                        correlationId: uuid_1.v4(),
                        timestamp: Date.now(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        },
                        initiator: {
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } }
                        }
                    }
                });
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { data } = await client({
                    method: 'post',
                    url: '/v2/',
                    data: command
                });
                assertthat_1.assert.that(data).is.equalTo({ id: command.id });
            });
            test('returns 500 if on received command throws an error.', async () => {
                ({ api } = await http_1.getApi({
                    corsOrigin: '*',
                    async onReceiveCommand() {
                        throw new Error('Failed to handle received command.');
                    },
                    async onCancelCommand() {
                        // Intentionally left blank.
                    },
                    application
                }));
                const command = new CommandWithMetadata_1.CommandWithMetadata({
                    aggregateIdentifier: {
                        context: { name: 'sampleContext' },
                        aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                    },
                    name: 'execute',
                    data: { strategy: 'succeed' },
                    id: uuid_1.v4(),
                    metadata: {
                        causationId: uuid_1.v4(),
                        correlationId: uuid_1.v4(),
                        timestamp: Date.now(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        },
                        initiator: {
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } }
                        }
                    }
                });
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/',
                    data: command,
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(500);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.UnknownError.code,
                    message: 'Unknown error.'
                });
            });
        });
        suite('POST /cancel', () => {
            let api, cancelledCommands;
            setup(async () => {
                cancelledCommands = [];
                ({ api } = await http_1.getApi({
                    corsOrigin: '*',
                    async onReceiveCommand() {
                        // Intentionally left blank.
                    },
                    async onCancelCommand({ commandIdentifierWithClient }) {
                        cancelledCommands.push(commandIdentifierWithClient);
                    },
                    application
                }));
            });
            test('returns 415 if the content-type header is not set to application/json.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/cancel',
                    headers: {
                        'content-type': 'text/plain'
                    },
                    data: {
                        aggregateIdentifier: {
                            context: { name: 'sampleContext' },
                            aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                        },
                        name: 'execute',
                        id: uuid_1.v4(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        }
                    },
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(415);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.ContentTypeMismatch.code,
                    message: 'Header content-type must be application/json.'
                });
            });
            test('returns 400 if a malformed command is sent.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/cancel',
                    data: {},
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(400);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.RequestMalformed.code,
                    message: 'Missing required property: aggregateIdentifier (at requestBody.aggregateIdentifier).'
                });
            });
            test('returns 400 if a non-existent context name is given.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/cancel',
                    data: {
                        aggregateIdentifier: {
                            context: { name: 'nonExistent' },
                            aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                        },
                        name: 'execute',
                        id: uuid_1.v4(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        }
                    },
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(400);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.ContextNotFound.code,
                    message: `Context 'nonExistent' not found.`
                });
            });
            test('returns 400 if a non-existent aggregate name is given.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/cancel',
                    data: {
                        aggregateIdentifier: {
                            context: { name: 'sampleContext' },
                            aggregate: { name: 'nonExistent', id: uuid_1.v4() }
                        },
                        name: 'execute',
                        id: uuid_1.v4(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        }
                    },
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(400);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.AggregateNotFound.code,
                    message: `Aggregate 'sampleContext.nonExistent' not found.`
                });
            });
            test('returns 400 if a non-existent command name is given.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/cancel',
                    data: {
                        aggregateIdentifier: {
                            context: { name: 'sampleContext' },
                            aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                        },
                        name: 'nonExistent',
                        id: uuid_1.v4(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        }
                    },
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(400);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.CommandNotFound.code,
                    message: `Command 'sampleContext.sampleAggregate.nonExistent' not found.`
                });
            });
            test('returns 200 if the command can be cancelled successfully.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status } = await client({
                    method: 'post',
                    url: '/v2/cancel',
                    data: {
                        aggregateIdentifier: {
                            context: { name: 'sampleContext' },
                            aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                        },
                        name: 'execute',
                        id: uuid_1.v4(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        }
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(200);
            });
            test('cancels commands.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const commandIdentifierWithClient = {
                    aggregateIdentifier: {
                        context: { name: 'sampleContext' },
                        aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                    },
                    name: 'execute',
                    id: uuid_1.v4(),
                    client: {
                        ip: '127.0.0.1',
                        user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                        token: '...'
                    }
                };
                await client({
                    method: 'post',
                    url: '/v2/cancel',
                    data: commandIdentifierWithClient
                });
                assertthat_1.assert.that(cancelledCommands.length).is.equalTo(1);
                assertthat_1.assert.that(cancelledCommands[0]).is.equalTo(commandIdentifierWithClient);
            });
            test('returns 500 if on cancel command throws an error.', async () => {
                ({ api } = await http_1.getApi({
                    corsOrigin: '*',
                    async onReceiveCommand() {
                        // Intentionally left blank.
                    },
                    async onCancelCommand() {
                        throw new Error('Failed to cancel command.');
                    },
                    application
                }));
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/cancel',
                    data: {
                        aggregateIdentifier: {
                            context: { name: 'sampleContext' },
                            aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                        },
                        name: 'execute',
                        id: uuid_1.v4(),
                        client: {
                            ip: '127.0.0.1',
                            user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                            token: '...'
                        }
                    },
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(500);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.UnknownError.code,
                    message: 'Unknown error.'
                });
            });
        });
    });
});
//# sourceMappingURL=httpTests.js.map