"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConsumerProgressStore = void 0;
const errors_1 = require("../../common/errors");
const InMemory_1 = require("./InMemory");
const MongoDb_1 = require("./MongoDb");
const MySql_1 = require("./MySql");
const Postgres_1 = require("./Postgres");
const SqlServer_1 = require("./SqlServer");
const createConsumerProgressStore = async function (options) {
    switch (options.type) {
        case 'InMemory': {
            return InMemory_1.InMemoryConsumerProgressStore.create(options);
        }
        case 'MariaDb': {
            return MySql_1.MySqlConsumerProgressStore.create(options);
        }
        case 'MongoDb': {
            return MongoDb_1.MongoDbConsumerProgressStore.create(options);
        }
        case 'MySql': {
            return MySql_1.MySqlConsumerProgressStore.create(options);
        }
        case 'Postgres': {
            return Postgres_1.PostgresConsumerProgressStore.create(options);
        }
        case 'SqlServer': {
            return SqlServer_1.SqlServerConsumerProgressStore.create(options);
        }
        default: {
            throw new errors_1.errors.DatabaseTypeInvalid();
        }
    }
};
exports.createConsumerProgressStore = createConsumerProgressStore;
//# sourceMappingURL=createConsumerProgressStore.js.map