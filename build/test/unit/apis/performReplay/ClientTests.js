"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const Client_1 = require("../../../../lib/apis/performReplay/http/v2/Client");
const errors_1 = require("../../../../lib/common/errors");
const http_1 = require("../../../../lib/apis/performReplay/http");
const getTestApplicationDirectory_1 = require("../../../shared/applications/getTestApplicationDirectory");
const loadApplication_1 = require("../../../../lib/common/application/loadApplication");
const runAsServer_1 = require("../../../shared/http/runAsServer");
const uuid_1 = require("uuid");
suite('performReplay/http/Client', () => {
    let application;
    suite('/v2', () => {
        suiteSetup(async () => {
            const applicationDirectory = getTestApplicationDirectory_1.getTestApplicationDirectory({ name: 'base', language: 'javascript' });
            application = await loadApplication_1.loadApplication({ applicationDirectory });
        });
        suite('performReplay', () => {
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
            test('performs a replay for the given flows.', async () => {
                const { socket } = await runAsServer_1.runAsServer({ app: api });
                const client = new Client_1.Client({
                    hostName: 'localhost',
                    portOrSocket: socket,
                    path: '/v2'
                });
                const aggregateId = uuid_1.v4();
                await client.performReplay({
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
            test('performs a replay for all flows if no flow is given.', async () => {
                const { socket } = await runAsServer_1.runAsServer({ app: api });
                const client = new Client_1.Client({
                    hostName: 'localhost',
                    portOrSocket: socket,
                    path: '/v2'
                });
                const aggregateId = uuid_1.v4();
                await client.performReplay({
                    aggregates: [{
                            aggregateIdentifier: {
                                context: { name: 'sampleContext' },
                                aggregate: { name: 'sampleAggregate', id: aggregateId }
                            },
                            from: 23,
                            to: 42
                        }]
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
            test('throws an error if an unknown context is given.', async () => {
                const { socket } = await runAsServer_1.runAsServer({ app: api });
                const client = new Client_1.Client({
                    hostName: 'localhost',
                    portOrSocket: socket,
                    path: '/v2'
                });
                const aggregateId = uuid_1.v4();
                await assertthat_1.assert.that(async () => {
                    await client.performReplay({
                        flowNames: ['sampleFlow'],
                        aggregates: [{
                                aggregateIdentifier: {
                                    context: { name: 'nonExistent' },
                                    aggregate: { name: 'sampleAggregate', id: aggregateId }
                                },
                                from: 23,
                                to: 42
                            }]
                    });
                }).is.throwingAsync((ex) => ex.code === errors_1.errors.ContextNotFound.code);
            });
            test('throws an error if an unknown aggregate is given.', async () => {
                const { socket } = await runAsServer_1.runAsServer({ app: api });
                const client = new Client_1.Client({
                    hostName: 'localhost',
                    portOrSocket: socket,
                    path: '/v2'
                });
                const aggregateId = uuid_1.v4();
                await assertthat_1.assert.that(async () => {
                    await client.performReplay({
                        flowNames: ['sampleFlow'],
                        aggregates: [{
                                aggregateIdentifier: {
                                    context: { name: 'sampleContext' },
                                    aggregate: { name: 'nonExistent', id: aggregateId }
                                },
                                from: 23,
                                to: 42
                            }]
                    });
                }).is.throwingAsync((ex) => ex.code === errors_1.errors.AggregateNotFound.code);
            });
            test('throws an error if an unknown flow is given.', async () => {
                const { socket } = await runAsServer_1.runAsServer({ app: api });
                const client = new Client_1.Client({
                    hostName: 'localhost',
                    portOrSocket: socket,
                    path: '/v2'
                });
                const aggregateId = uuid_1.v4();
                await assertthat_1.assert.that(async () => {
                    await client.performReplay({
                        flowNames: ['nonExistent'],
                        aggregates: [{
                                aggregateIdentifier: {
                                    context: { name: 'sampleContext' },
                                    aggregate: { name: 'sampleAggregate', id: aggregateId }
                                },
                                from: 23,
                                to: 42
                            }]
                    });
                }).is.throwingAsync((ex) => ex.code === errors_1.errors.FlowNotFound.code);
            });
        });
    });
});
//# sourceMappingURL=ClientTests.js.map