"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDescription = void 0;
const errors_1 = require("../../../../common/errors");
const flaschenpost_1 = require("flaschenpost");
const getApplicationDescription_1 = require("../../../../common/application/getApplicationDescription");
const getViewsDescriptionSchema_1 = require("../../../../common/schemas/getViewsDescriptionSchema");
const validate_value_1 = require("validate-value");
const withLogMetadata_1 = require("../../../../common/utils/logging/withLogMetadata");
const logger = flaschenpost_1.flaschenpost.getLogger();
const getDescription = {
    description: `Returns a description of the application's views.`,
    path: 'description',
    request: {},
    response: {
        statusCodes: [200],
        body: getViewsDescriptionSchema_1.getViewsDescriptionSchema()
    },
    getHandler({ application }) {
        const responseBodySchema = new validate_value_1.Value(getDescription.response.body);
        const applicationDescription = getApplicationDescription_1.getApplicationDescription({ application });
        return function (req, res) {
            try {
                const response = applicationDescription.views;
                responseBodySchema.validate(response, { valueName: 'responseBody' });
                res.send(response);
            }
            catch (ex) {
                const error = new errors_1.errors.UnknownError(undefined, { cause: ex });
                logger.error('An unknown error occured.', withLogMetadata_1.withLogMetadata('api', 'queryView', { error }));
                res.status(500).json({
                    code: error.code,
                    message: error.message
                });
            }
        };
    }
};
exports.getDescription = getDescription;
//# sourceMappingURL=getDescription.js.map