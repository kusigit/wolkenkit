"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLockStore = void 0;
const errors_1 = require("../../common/errors");
const InMemory_1 = require("./InMemory");
const MongoDb_1 = require("./MongoDb");
const MySql_1 = require("./MySql");
const Postgres_1 = require("./Postgres");
const Redis_1 = require("./Redis");
const SqlServer_1 = require("./SqlServer");
const createLockStore = async function (options) {
    switch (options.type) {
        case 'InMemory': {
            return InMemory_1.InMemoryLockStore.create(options);
        }
        case 'MariaDb': {
            return MySql_1.MySqlLockStore.create(options);
        }
        case 'MongoDb': {
            return MongoDb_1.MongoDbLockStore.create(options);
        }
        case 'MySql': {
            return MySql_1.MySqlLockStore.create(options);
        }
        case 'Postgres': {
            return Postgres_1.PostgresLockStore.create(options);
        }
        case 'Redis': {
            return Redis_1.RedisLockStore.create(options);
        }
        case 'SqlServer': {
            return SqlServer_1.SqlServerLockStore.create(options);
        }
        default: {
            throw new errors_1.errors.DatabaseTypeInvalid();
        }
    }
};
exports.createLockStore = createLockStore;
//# sourceMappingURL=createLockStore.js.map