"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCancelCommandFieldConfiguration = void 0;
const addMissingPrototype_1 = require("../../../../common/utils/graphql/addMissingPrototype");
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const get_graphql_from_jsonschema_1 = require("get-graphql-from-jsonschema");
const getItemIdentifierSchema_1 = require("../../../../common/schemas/getItemIdentifierSchema");
const validateItemIdentifier_1 = require("../../../../common/validators/validateItemIdentifier");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const graphql_1 = require("graphql");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getCancelCommandFieldConfiguration = function ({ application, onCancelCommand }) {
    const cancelTypeDefs = get_graphql_from_jsonschema_1.getGraphqlFromJsonSchema({
        schema: getItemIdentifierSchema_1.getItemIdentifierSchema(),
        rootName: 'CommandIdentifier',
        direction: 'input'
    });
    return {
        type: new graphql_1.GraphQLObjectType({
            name: 'cancel',
            fields: {
                success: {
                    type: graphql_1.GraphQLBoolean,
                    resolve(source) {
                        return source.success;
                    }
                }
            }
        }),
        args: {
            commandIdentifier: {
                type: graphql_1.buildSchema(cancelTypeDefs.typeDefinitions.join('\n')).getType(cancelTypeDefs.typeName)
            }
        },
        async resolve(source, { commandIdentifier: rawCommandIdentifier }, { clientMetadata }) {
            const commandIdentifier = addMissingPrototype_1.addMissingPrototype({ value: rawCommandIdentifier });
            try {
                new validate_value_1.Value(getItemIdentifierSchema_1.getItemIdentifierSchema()).validate(commandIdentifier, { valueName: 'commandIdentifier' });
            }
            catch (ex) {
                throw new errors_1.errors.ItemIdentifierMalformed(ex.message);
            }
            validateItemIdentifier_1.validateItemIdentifier({ itemIdentifier: commandIdentifier, application, itemType: 'command' });
            const commandIdentifierWithClient = {
                ...commandIdentifier,
                client: clientMetadata
            };
            logger.debug('Received request to cancel command.', withLogMetadata_1.withLogMetadata('api', 'graphql', { commandIdentifierWithClient }));
            try {
                await onCancelCommand({ commandIdentifierWithClient });
                return { success: true };
            }
            catch {
                return { success: false };
            }
        }
    };
};
exports.getCancelCommandFieldConfiguration = getCancelCommandFieldConfiguration;
//# sourceMappingURL=getCancelCommandFieldConfiguration.js.map