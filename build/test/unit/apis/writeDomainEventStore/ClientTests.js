"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asJsonStream_1 = require("../../../shared/http/asJsonStream");
const assertthat_1 = require("assertthat");
const buildDomainEvent_1 = require("../../../../lib/common/utils/test/buildDomainEvent");
const Client_1 = require("../../../../lib/apis/writeDomainEventStore/http/v2/Client");
const createDomainEventStore_1 = require("../../../../lib/stores/domainEventStore/createDomainEventStore");
const errors_1 = require("../../../../lib/common/errors");
const http_1 = require("../../../../lib/apis/writeDomainEventStore/http");
const runAsServer_1 = require("../../../shared/http/runAsServer");
const uuid_1 = require("uuid");
suite('writeDomainEventStore/http/Client', () => {
    suite('/v2', () => {
        let api, domainEventStore;
        setup(async () => {
            domainEventStore = await createDomainEventStore_1.createDomainEventStore({
                type: 'InMemory'
            });
            ({ api } = await http_1.getApi({
                corsOrigin: '*',
                domainEventStore
            }));
        });
        suite('storeDomainEvents', () => {
            test('stores the given domain events.', async () => {
                const aggregateIdentifier = {
                    context: {
                        name: 'sampleContext'
                    },
                    aggregate: {
                        name: 'sampleAggregate',
                        id: uuid_1.v4()
                    }
                };
                const firstDomainEvent = buildDomainEvent_1.buildDomainEvent({
                    aggregateIdentifier,
                    name: 'succeeded',
                    data: {},
                    metadata: {
                        revision: 1,
                        initiator: { user: { id: 'jane.doe', claims: { sub: 'jane.doe' } } }
                    }
                });
                const secondDomainEvent = buildDomainEvent_1.buildDomainEvent({
                    aggregateIdentifier,
                    name: 'succeeded',
                    data: {},
                    metadata: {
                        revision: 2,
                        initiator: { user: { id: 'jane.doe', claims: { sub: 'jane.doe' } } }
                    }
                });
                const { socket } = await runAsServer_1.runAsServer({ app: api });
                const client = new Client_1.Client({
                    hostName: 'localhost',
                    portOrSocket: socket,
                    path: '/v2'
                });
                await client.storeDomainEvents({
                    domainEvents: [
                        firstDomainEvent,
                        secondDomainEvent
                    ]
                });
                const domainEventReplay = await domainEventStore.getReplayForAggregate({ aggregateId: aggregateIdentifier.aggregate.id });
                await new Promise((resolve) => {
                    domainEventReplay.pipe(asJsonStream_1.asJsonStream([
                        (domainEvent) => {
                            assertthat_1.assert.that(domainEvent).is.equalTo(firstDomainEvent);
                        },
                        (domainEvent) => {
                            assertthat_1.assert.that(domainEvent).is.equalTo(secondDomainEvent);
                            resolve();
                        }
                    ], true));
                });
            });
            test('throws a domain events missing error if the given array is empty.', async () => {
                const { socket } = await runAsServer_1.runAsServer({ app: api });
                const client = new Client_1.Client({
                    hostName: 'localhost',
                    portOrSocket: socket,
                    path: '/v2'
                });
                await assertthat_1.assert.that(async () => client.storeDomainEvents({ domainEvents: [] })).is.throwingAsync((ex) => ex.code === errors_1.errors.ParameterInvalid.code && ex.message === 'Domain events are missing.');
            });
        });
        suite('storeSnapshot', () => {
            test('stores the given snapshot.', async () => {
                const aggregateIdentifier = {
                    context: {
                        name: 'sampleContext'
                    },
                    aggregate: {
                        name: 'sampleAggregate',
                        id: uuid_1.v4()
                    }
                };
                const snapshot = {
                    aggregateIdentifier,
                    revision: 1,
                    state: {}
                };
                const { socket } = await runAsServer_1.runAsServer({ app: api });
                const client = new Client_1.Client({
                    hostName: 'localhost',
                    portOrSocket: socket,
                    path: '/v2'
                });
                await client.storeSnapshot({ snapshot });
                assertthat_1.assert.that(await domainEventStore.getSnapshot({ aggregateIdentifier })).is.equalTo(snapshot);
            });
            test('overwrites the previous snapshot if one existed.', async () => {
                const aggregateIdentifier = {
                    context: {
                        name: 'sampleContext'
                    },
                    aggregate: {
                        name: 'sampleAggregate',
                        id: uuid_1.v4()
                    }
                };
                const firstSnapshot = {
                    aggregateIdentifier,
                    revision: 1,
                    state: {}
                };
                const secondSnapshot = {
                    aggregateIdentifier,
                    revision: 2,
                    state: {}
                };
                const { socket } = await runAsServer_1.runAsServer({ app: api });
                const client = new Client_1.Client({
                    hostName: 'localhost',
                    portOrSocket: socket,
                    path: '/v2'
                });
                await client.storeSnapshot({ snapshot: firstSnapshot });
                await client.storeSnapshot({ snapshot: secondSnapshot });
                assertthat_1.assert.that(await domainEventStore.getSnapshot({ aggregateIdentifier })).is.equalTo(secondSnapshot);
            });
        });
    });
});
//# sourceMappingURL=ClientTests.js.map