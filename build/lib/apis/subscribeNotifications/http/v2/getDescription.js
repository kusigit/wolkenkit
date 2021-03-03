"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDescription = void 0;
const getApplicationDescription_1 = require("../../../../common/application/getApplicationDescription");
const getNotificationsDescriptionSchema_1 = require("../../../../common/schemas/getNotificationsDescriptionSchema");
const validate_value_1 = require("validate-value");
const getDescription = {
    description: `Returns a description of the application's notifications.`,
    path: 'description',
    request: {},
    response: {
        statusCodes: [200],
        body: getNotificationsDescriptionSchema_1.getNotificationsDescriptionSchema()
    },
    getHandler({ application }) {
        const responseBodySchema = new validate_value_1.Value(getDescription.response.body);
        const applicationDescription = getApplicationDescription_1.getApplicationDescription({ application });
        return function (req, res) {
            const response = applicationDescription.notifications;
            responseBodySchema.validate(response, { valueName: 'responseBody' });
            res.send(response);
        };
    }
};
exports.getDescription = getDescription;
//# sourceMappingURL=getDescription.js.map