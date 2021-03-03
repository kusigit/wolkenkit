"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPriorityQueueStore = void 0;
const errors_1 = require("../../common/errors");
const InMemory_1 = require("./InMemory");
const MongoDb_1 = require("./MongoDb");
const MySql_1 = require("./MySql");
const Postgres_1 = require("./Postgres");
const SqlServer_1 = require("./SqlServer");
const createPriorityQueueStore = async function (options) {
    switch (options.type) {
        case 'InMemory': {
            return await InMemory_1.InMemoryPriorityQueueStore.create(options);
        }
        case 'MariaDb': {
            return await MySql_1.MySqlPriorityQueueStore.create(options);
        }
        case 'MongoDb': {
            return await MongoDb_1.MongoDbPriorityQueueStore.create(options);
        }
        case 'MySql': {
            return await MySql_1.MySqlPriorityQueueStore.create(options);
        }
        case 'Postgres': {
            return await Postgres_1.PostgresPriorityQueueStore.create(options);
        }
        case 'SqlServer': {
            return await SqlServer_1.SqlServerPriorityQueueStore.create(options);
        }
        default: {
            throw new errors_1.errors.DatabaseTypeInvalid();
        }
    }
};
exports.createPriorityQueueStore = createPriorityQueueStore;
//# sourceMappingURL=createPriorityQueueStore.js.map