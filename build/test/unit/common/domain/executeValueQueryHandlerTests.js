"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertthat_1 = require("assertthat");
const errors_1 = require("../../../../lib/common/errors");
const executeValueQueryHandler_1 = require("../../../../lib/common/domain/executeValueQueryHandler");
const getClientService_1 = require("../../../../lib/common/services/getClientService");
const getTestApplicationDirectory_1 = require("../../../shared/applications/getTestApplicationDirectory");
const loadApplication_1 = require("../../../../lib/common/application/loadApplication");
const uuid_1 = require("uuid");
suite('executeValueQueryHandler', () => {
    let application, clientService;
    setup(async () => {
        const applicationDirectory = getTestApplicationDirectory_1.getTestApplicationDirectory({ name: 'withComplexQueries', language: 'javascript' });
        application = await loadApplication_1.loadApplication({ applicationDirectory });
        clientService = getClientService_1.getClientService({ clientMetadata: {
                ip: '127.0.0.1',
                user: { id: 'jane.doe', claims: { sub: 'jane.doe' } },
                token: '...'
            } });
    });
    test('throws an exception if the view name does not exist.', async () => {
        const queryHandlerIdentifier = {
            view: { name: 'someView' },
            name: 'all'
        };
        await assertthat_1.assert.that(async () => {
            await executeValueQueryHandler_1.executeValueQueryHandler({
                application,
                queryHandlerIdentifier,
                services: {
                    client: clientService
                },
                options: {}
            });
        }).is.throwingAsync((ex) => ex.code === errors_1.errors.ViewNotFound.code);
    });
    test('throws an exception if the query handler name does not exist.', async () => {
        const queryHandlerIdentifier = {
            view: { name: 'sampleView' },
            name: 'someQueryHandler'
        };
        await assertthat_1.assert.that(async () => {
            await executeValueQueryHandler_1.executeValueQueryHandler({
                application,
                queryHandlerIdentifier,
                services: {
                    client: clientService
                },
                options: {}
            });
        }).is.throwingAsync((ex) => ex.code === errors_1.errors.QueryHandlerNotFound.code);
    });
    test('throws an exception if the query handler matches a stream query, not a value query.', async () => {
        const queryHandlerIdentifier = {
            view: { name: 'sampleView' },
            name: 'all'
        };
        await assertthat_1.assert.that(async () => {
            await executeValueQueryHandler_1.executeValueQueryHandler({
                application,
                queryHandlerIdentifier,
                services: {
                    client: clientService
                },
                options: {}
            });
        }).is.throwingAsync((ex) => ex.code === errors_1.errors.QueryHandlerTypeMismatch.code);
    });
    test('throws an exception if the options do not match the options schema.', async () => {
        const queryHandlerIdentifier = {
            view: { name: 'sampleView' },
            name: 'valueWithOptions'
        };
        const domainEvents = [
            {
                aggregateIdentifier: {
                    context: { name: 'sampleContext' },
                    aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                },
                name: 'executed',
                id: uuid_1.v4()
            },
            {
                aggregateIdentifier: {
                    context: { name: 'sampleContext' },
                    aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                },
                name: 'not-executed',
                id: uuid_1.v4()
            }
        ];
        application.infrastructure.ask.viewStore.domainEvents = domainEvents;
        await assertthat_1.assert.that(async () => {
            await executeValueQueryHandler_1.executeValueQueryHandler({
                application,
                queryHandlerIdentifier,
                services: { client: clientService },
                options: {}
            });
        }).is.throwingAsync((ex) => ex.code === errors_1.errors.QueryOptionsInvalid.code);
    });
    test('returns the result item.', async () => {
        const queryHandlerIdentifier = {
            view: { name: 'sampleView' },
            name: 'first'
        };
        const domainEvents = [
            {
                aggregateIdentifier: {
                    context: { name: 'sampleContext' },
                    aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                },
                name: 'executed',
                id: uuid_1.v4()
            },
            {
                aggregateIdentifier: {
                    context: { name: 'sampleContext' },
                    aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                },
                name: 'executed',
                id: uuid_1.v4()
            }
        ];
        application.infrastructure.ask.viewStore.domainEvents = domainEvents;
        const queryResultItem = await executeValueQueryHandler_1.executeValueQueryHandler({
            application,
            queryHandlerIdentifier,
            services: { client: clientService },
            options: {}
        });
        assertthat_1.assert.that(queryResultItem).is.equalTo(domainEvents[0]);
    });
    test('throws an exception if the query handler throws a NotFound exception.', async () => {
        const queryHandlerIdentifier = {
            view: { name: 'sampleView' },
            name: 'notFound'
        };
        application.infrastructure.ask.viewStore.domainEvents = [];
        await assertthat_1.assert.that(async () => {
            await executeValueQueryHandler_1.executeValueQueryHandler({
                application,
                queryHandlerIdentifier,
                services: { client: clientService },
                options: {}
            });
        }).is.throwingAsync((ex) => ex.code === errors_1.errors.NotFound.code);
    });
    test('throws an exception if the result item does not match the schema.', async () => {
        const queryHandlerIdentifier = {
            view: { name: 'sampleView' },
            name: 'first'
        };
        const domainEvents = [
            {
                foo: 'bar'
            }
        ];
        application.infrastructure.ask.viewStore.domainEvents = domainEvents;
        await assertthat_1.assert.that(async () => {
            await executeValueQueryHandler_1.executeValueQueryHandler({
                application,
                queryHandlerIdentifier,
                services: { client: clientService },
                options: {}
            });
        }).is.throwingAsync((ex) => ex.code === errors_1.errors.QueryResultInvalid.code);
    });
    test('throws an exception if the query is not authorized.', async () => {
        const queryHandlerIdentifier = {
            view: { name: 'sampleView' },
            name: 'valueAuthorized'
        };
        const domainEvents = [
            {
                aggregateIdentifier: {
                    context: { name: 'sampleContext' },
                    aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                },
                name: 'executed',
                id: uuid_1.v4()
            },
            {
                aggregateIdentifier: {
                    context: { name: 'sampleContext' },
                    aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                },
                name: 'executed',
                id: uuid_1.v4()
            }
        ];
        application.infrastructure.ask.viewStore.domainEvents = domainEvents;
        await assertthat_1.assert.that(async () => {
            await executeValueQueryHandler_1.executeValueQueryHandler({
                application,
                queryHandlerIdentifier,
                services: { client: {
                        ...clientService,
                        user: {
                            ...clientService.user,
                            id: 'not.jane.doe'
                        }
                    } },
                options: {}
            });
        }).is.throwingAsync((ex) => ex.code === errors_1.errors.QueryNotAuthorized.code);
    });
    test('returns the result item and respects the given options.', async () => {
        const queryHandlerIdentifier = {
            view: { name: 'sampleView' },
            name: 'valueWithOptions'
        };
        const domainEvents = [
            {
                aggregateIdentifier: {
                    context: { name: 'sampleContext' },
                    aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                },
                name: 'executed',
                id: uuid_1.v4()
            },
            {
                aggregateIdentifier: {
                    context: { name: 'sampleContext' },
                    aggregate: { name: 'sampleAggregate', id: uuid_1.v4() }
                },
                name: 'not-executed',
                id: uuid_1.v4()
            }
        ];
        application.infrastructure.ask.viewStore.domainEvents = domainEvents;
        const queryResultItem = await executeValueQueryHandler_1.executeValueQueryHandler({
            application,
            queryHandlerIdentifier,
            services: { client: clientService },
            options: { filter: { domainEventName: 'executed' } }
        });
        assertthat_1.assert.that(queryResultItem).is.equalTo(domainEvents[0]);
    });
});
//# sourceMappingURL=executeValueQueryHandlerTests.js.map