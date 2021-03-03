"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDomainEventStore = void 0;
const errors_1 = require("../../common/errors");
const InMemory_1 = require("./InMemory");
const MongoDb_1 = require("./MongoDb");
const MySql_1 = require("./MySql");
const Postgres_1 = require("./Postgres");
const SqlServer_1 = require("./SqlServer");
const createDomainEventStore = async function (options) {
    switch (options.type) {
        case 'InMemory': {
            return InMemory_1.InMemoryDomainEventStore.create(options);
        }
        case 'MariaDb': {
            return MySql_1.MySqlDomainEventStore.create(options);
        }
        case 'MongoDb': {
            return MongoDb_1.MongoDbDomainEventStore.create(options);
        }
        case 'MySql': {
            return MySql_1.MySqlDomainEventStore.create(options);
        }
        case 'Postgres': {
            return Postgres_1.PostgresDomainEventStore.create(options);
        }
        case 'SqlServer': {
            return SqlServer_1.SqlServerDomainEventStore.create(options);
        }
        default: {
            throw new errors_1.errors.DatabaseTypeInvalid();
        }
    }
};
exports.createDomainEventStore = createDomainEventStore;
//# sourceMappingURL=createDomainEventStore.js.map