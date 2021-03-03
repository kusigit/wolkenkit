"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueryFieldConfiguration = void 0;
const addMissingPrototype_1 = require("../../../../common/utils/graphql/addMissingPrototype");
const errors_1 = require("../../../../common/errors");
const executeStreamQueryHandler_1 = require("../../../../common/domain/executeStreamQueryHandler");
const executeValueQueryHandler_1 = require("../../../../common/domain/executeValueQueryHandler");
const getClientService_1 = require("../../../../common/services/getClientService");
const get_graphql_from_jsonschema_1 = require("get-graphql-from-jsonschema");
const graphql_1 = require("graphql");
const getQueryFieldConfiguration = function ({ application, viewName, queryName, queryHandler }) {
    var _a, _b;
    if (!queryHandler.getResultItemSchema) {
        throw new errors_1.errors.GraphQlError(`Result item schema in query '${viewName}.${queryName}' is missing, but required for GraphQL.`);
    }
    const resultItemSchema = queryHandler.getResultItemSchema();
    const resultItemGraphqlTypeDefinitions = get_graphql_from_jsonschema_1.getGraphqlFromJsonSchema({
        rootName: `${viewName}_${queryName}_resultItem`,
        schema: resultItemSchema,
        direction: 'output'
    });
    const resultGraphqlType = graphql_1.buildSchema(resultItemGraphqlTypeDefinitions.typeDefinitions.join('\n')).getType(resultItemGraphqlTypeDefinitions.typeName);
    const argumentConfigurationMap = {};
    if (queryHandler.getOptionsSchema) {
        const optionsSchema = queryHandler.getOptionsSchema();
        const optionsGraphqlTypeDefinitions = get_graphql_from_jsonschema_1.getGraphqlFromJsonSchema({
            rootName: `${viewName}_${queryName}_options`,
            schema: optionsSchema,
            direction: 'input'
        });
        const optionsGraphqlType = graphql_1.buildSchema(optionsGraphqlTypeDefinitions.typeDefinitions.join('\n')).getType(optionsGraphqlTypeDefinitions.typeName);
        argumentConfigurationMap.options = { type: optionsGraphqlType };
    }
    return {
        type: queryHandler.type === 'stream' ? new graphql_1.GraphQLList(resultGraphqlType) : resultGraphqlType,
        args: argumentConfigurationMap,
        description: (_b = (_a = queryHandler.getDocumentation) === null || _a === void 0 ? void 0 : _a.call(queryHandler)) !== null && _b !== void 0 ? _b : 'No documentation available.',
        async resolve(source, { options: rawOptions }, { clientMetadata }) {
            const options = addMissingPrototype_1.addMissingPrototype({ value: rawOptions });
            switch (queryHandler.type) {
                case 'value': {
                    const queryResultItem = await executeValueQueryHandler_1.executeValueQueryHandler({
                        application,
                        queryHandlerIdentifier: { view: { name: viewName }, name: queryName },
                        options,
                        services: {
                            client: getClientService_1.getClientService({ clientMetadata })
                        }
                    });
                    return queryResultItem;
                }
                case 'stream': {
                    const queryResultStream = await executeStreamQueryHandler_1.executeStreamQueryHandler({
                        application,
                        queryHandlerIdentifier: { view: { name: viewName }, name: queryName },
                        options,
                        services: {
                            client: getClientService_1.getClientService({ clientMetadata })
                        }
                    });
                    const queryResultItems = [];
                    for await (const queryResultItem of queryResultStream) {
                        queryResultItems.push(queryResultItem);
                    }
                    return queryResultItems;
                }
                default: {
                    throw new errors_1.errors.InvalidOperation();
                }
            }
        }
    };
};
exports.getQueryFieldConfiguration = getQueryFieldConfiguration;
//# sourceMappingURL=getQueryFieldConfiguration.js.map