"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const http_1 = require("../../../../lib/apis/performReplay/http");
const getTestApplicationDirectory_1 = require("../../../shared/applications/getTestApplicationDirectory");
const loadApplication_1 = require("../../../../lib/common/application/loadApplication");
const runAsServer_1 = require("../../../shared/http/runAsServer");
const uuid_1 = require("uuid");
suite('performReplay/http', () => {
    let application;
    suite('/v2', () => {
        suiteSetup(async () => {
            const applicationDirectory = getTestApplicationDirectory_1.getTestApplicationDirectory({ name: 'base', language: 'javascript' });
            application = await loadApplication_1.loadApplication({ applicationDirectory });
        });
        suite('POST /', () => {
            let api, requestedReplays;
            setup(async () => {
                requestedReplays = [];
                ({ api } = await http_1.getApi({
                    corsOrigin: '*',
                    async performReplay({ flowNames, aggregates }) {
                        requestedReplays.push({ flowNames, aggregates });
                    },
                    application
                }));
            });
            test('returns 415 if the content-type header is missing.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: `/v2/`,
                    headers: {
                        'content-type': ''
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
            test('returns 415 if content-type is not set to application/json.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: `/v2/`,
                    headers: {
                        'content-type': 'text/plain'
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
            test('returns 400 if a replay is requested with a payload that does not match the schema.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: `/v2/`,
                    data: {
                        flowNames: [],
                        aggregates: [{
                                aggregateIdentifier: {
                                    context: { name: 'sampleContext' },
                                    aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                                },
                                from: 23,
                                to: 42
                            }]
                    },
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(400);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.RequestMalformed.code,
                    message: 'Array is too short (0), minimum 1 (at requestBody.flowNames).'
                });
            });
            test('returns 400 if a replay is requested for an unknown context.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: `/v2/`,
                    data: {
                        aggregates: [{
                                aggregateIdentifier: {
                                    context: { name: 'nonExistent' },
                                    aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                                },
                                from: 23,
                                to: 42
                            }]
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
            test('returns 400 if a replay is requested for an unknown aggregate.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: `/v2/`,
                    data: {
                        aggregates: [{
                                aggregateIdentifier: {
                                    context: { name: 'sampleContext' },
                                    aggregate: { name: 'nonExistent', id: uuid_1.v4() }
                                },
                                from: 23,
                                to: 42
                            }]
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
            test('returns 400 if a replay is requested for an unknown flow.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: `/v2/`,
                    data: {
                        flowNames: ['nonExistent'],
                        aggregates: [{
                                aggregateIdentifier: {
                                    context: { name: 'sampleContext' },
                                    aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                                },
                                from: 23,
                                to: 42
                            }]
                    },
                    responseType: 'text',
                    validateStatus() {
                        return true;
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(400);
                assertthat_1.assert.that(data).is.equalTo({
                    code: errors_1.errors.FlowNotFound.code,
                    message: `Flow 'nonExistent' not found.`
                });
            });
            test('returns 200 if a replay is requested.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status } = await client({
                    method: 'post',
                    url: `/v2/`,
                    data: {
                        flowNames: ['sampleFlow'],
                        aggregates: [{
                                aggregateIdentifier: {
                                    context: { name: 'sampleContext' },
                                    aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                                },
                                from: 23,
                                to: 42
                            }]
                    }
                });
                assertthat_1.assert.that(status).is.equalTo(200);
            });
            test('receives replay requests.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const aggregateId = uuid_1.v4();
                await client({
                    method: 'post',
                    url: `/v2/`,
                    data: {
                        flowNames: ['sampleFlow'],
                        aggregates: [{
                                aggregateIdentifier: {
                                    context: { name: 'sampleContext' },
                                    aggregate: { name: 'sampleAggregate', id: aggregateId }
                                },
                                from: 23,
                                to: 42
                            }]
                    }
                });
                assertthat_1.assert.that(requestedReplays.length).is.equalTo(1);
                assertthat_1.assert.that(requestedReplays[0]).is.equalTo({
                    flowNames: ['sampleFlow'],
                    aggregates: [{
                            aggregateIdentifier: {
                                context: { name: 'sampleContext' },
                                aggregate: { name: 'sampleAggregate', id: aggregateId }
                            },
                            from: 23,
                            to: 42
                        }]
                });
            });
            test('replays all flows if no flow is given.', async () => {
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const aggregateId = uuid_1.v4();
                await client({
                    method: 'post',
                    url: `/v2/`,
                    data: {
                        aggregates: [{
                                aggregateIdentifier: {
                                    context: { name: 'sampleContext' },
                                    aggregate: { name: 'sampleAggregate', id: aggregateId }
                                },
                                from: 23,
                                to: 42
                            }]
                    }
                });
                assertthat_1.assert.that(requestedReplays.length).is.equalTo(1);
                assertthat_1.assert.that(requestedReplays[0]).is.equalTo({
                    flowNames: ['sampleFlow'],
                    aggregates: [{
                            aggregateIdentifier: {
                                context: { name: 'sampleContext' },
                                aggregate: { name: 'sampleAggregate', id: aggregateId }
                            },
                            from: 23,
                            to: 42
                        }]
                });
            });
            test('returns 500 if on perform replay throws an error.', async () => {
                ({ api } = await http_1.getApi({
                    corsOrigin: '*',
                    async performReplay() {
                        throw new Error('Failed to handle requested replay.');
                    },
                    application
                }));
                const { client } = await runAsServer_1.runAsServer({ app: api });
                const { status, data } = await client({
                    method: 'post',
                    url: '/v2/',
                    data: {
                        flowNames: ['sampleFlow'],
                        aggregates: [{
                                aggregateIdentifier: {
                                    context: { name: 'sampleContext' },
                                    aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                                },
                                from: 23,
                                to: 42
                            }]
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