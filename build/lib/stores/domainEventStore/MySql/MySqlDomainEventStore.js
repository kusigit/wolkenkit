"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlDomainEventStore = void 0;
const DomainEvent_1 = require("../../../common/elements/DomainEvent");
const errors_1 = require("../../../common/errors");
const retry_ignore_abort_1 = require("retry-ignore-abort");
const runQuery_1 = require("../../utils/mySql/runQuery");
const mysql_1 = require("mysql");
const stream_1 = require("stream");
class MySqlDomainEventStore {
    constructor({ tableNames, pool }) {
        this.tableNames = tableNames;
        this.pool = pool;
    }
    static onUnexpectedClose() {
        throw new Error('Connection closed unexpectedly.');
    }
    static releaseConnection({ connection }) {
        connection.removeListener('end', MySqlDomainEventStore.onUnexpectedClose);
        connection.release();
    }
    async getDatabase() {
        const database = await retry_ignore_abort_1.retry(async () => new Promise((resolve, reject) => {
            this.pool.getConnection((err, poolConnection) => {
                if (err) {
                    return reject(err);
                }
                resolve(poolConnection);
            });
        }));
        return database;
    }
    static async create({ hostName, port, userName, password, database, tableNames }) {
        const pool = mysql_1.createPool({
            host: hostName,
            port,
            user: userName,
            password,
            database,
            connectTimeout: 0,
            multipleStatements: true
        });
        pool.on('connection', (connection) => {
            connection.on('error', (err) => {
                throw err;
            });
            connection.on('end', MySqlDomainEventStore.onUnexpectedClose);
        });
        return new MySqlDomainEventStore({ tableNames, pool });
    }
    async getLastDomainEvent({ aggregateIdentifier }) {
        const connection = await this.getDatabase();
        try {
            const [rows] = await runQuery_1.runQuery({
                connection,
                query: `SELECT domainEvent
          FROM \`${this.tableNames.domainEvents}\`
          WHERE aggregateId = UuidToBin(?)
          ORDER BY revision DESC
          LIMIT 1`,
                parameters: [aggregateIdentifier.aggregate.id]
            });
            if (rows.length === 0) {
                return;
            }
            const domainEvent = new DomainEvent_1.DomainEvent(JSON.parse(rows[0].domainEvent));
            return domainEvent;
        }
        finally {
            MySqlDomainEventStore.releaseConnection({ connection });
        }
    }
    async getDomainEventsByCausationId({ causationId }) {
        const connection = await this.getDatabase();
        const domainEventStream = connection.query(`SELECT domainEvent
          FROM \`${this.tableNames.domainEvents}\`
          WHERE causationId = UuidToBin(?)`, [causationId]);
        const passThrough = new stream_1.PassThrough({ objectMode: true });
        const unsubscribe = function () {
            // Listeners should be removed here, but the mysql typings don't support
            // that.
            MySqlDomainEventStore.releaseConnection({ connection });
        };
        const onEnd = function () {
            unsubscribe();
            passThrough.end();
        };
        const onError = function (err) {
            unsubscribe();
            passThrough.emit('error', err);
            passThrough.end();
        };
        const onResult = function (row) {
            const domainEvent = new DomainEvent_1.DomainEvent(JSON.parse(row.domainEvent));
            passThrough.write(domainEvent);
        };
        domainEventStream.on('end', onEnd);
        domainEventStream.on('error', onError);
        domainEventStream.on('result', onResult);
        return passThrough;
    }
    async hasDomainEventsWithCausationId({ causationId }) {
        const connection = await this.getDatabase();
        try {
            const [rows] = await runQuery_1.runQuery({
                connection,
                query: `SELECT 1
          FROM \`${this.tableNames.domainEvents}\`
          WHERE causationId = UuidToBin(?)`,
                parameters: [causationId]
            });
            return rows.length > 0;
        }
        finally {
            MySqlDomainEventStore.releaseConnection({ connection });
        }
    }
    async getDomainEventsByCorrelationId({ correlationId }) {
        const connection = await this.getDatabase();
        const domainEventStream = connection.query(`SELECT domainEvent
          FROM \`${this.tableNames.domainEvents}\`
          WHERE correlationId = UuidToBin(?)`, [correlationId]);
        const passThrough = new stream_1.PassThrough({ objectMode: true });
        const unsubscribe = function () {
            // Listeners should be removed here, but the mysql typings don't support
            // that.
            MySqlDomainEventStore.releaseConnection({ connection });
        };
        const onEnd = function () {
            unsubscribe();
            passThrough.end();
        };
        const onError = function (err) {
            unsubscribe();
            passThrough.emit('error', err);
            passThrough.end();
        };
        const onResult = function (row) {
            const domainEvent = new DomainEvent_1.DomainEvent(JSON.parse(row.domainEvent));
            passThrough.write(domainEvent);
        };
        domainEventStream.on('end', onEnd);
        domainEventStream.on('error', onError);
        domainEventStream.on('result', onResult);
        return passThrough;
    }
    async getReplay({ fromTimestamp = 0 } = {}) {
        if (fromTimestamp < 0) {
            throw new errors_1.errors.ParameterInvalid(`Parameter 'fromTimestamp' must be at least 0.`);
        }
        const connection = await this.getDatabase();
        const passThrough = new stream_1.PassThrough({ objectMode: true });
        const domainEventStream = connection.query(`
      SELECT domainEvent
        FROM \`${this.tableNames.domainEvents}\`
        WHERE timestamp >= ?
        ORDER BY aggregateId ASC, revision ASC
      `, [fromTimestamp]);
        const unsubscribe = function () {
            // Listeners should be removed here, but the mysql typings don't support
            // that.
            MySqlDomainEventStore.releaseConnection({ connection });
        };
        const onEnd = function () {
            unsubscribe();
            passThrough.end();
        };
        const onError = function (err) {
            unsubscribe();
            passThrough.emit('error', err);
            passThrough.end();
        };
        const onResult = function (row) {
            const domainEvent = new DomainEvent_1.DomainEvent(JSON.parse(row.domainEvent));
            passThrough.write(domainEvent);
        };
        domainEventStream.on('end', onEnd);
        domainEventStream.on('error', onError);
        domainEventStream.on('result', onResult);
        return passThrough;
    }
    async getReplayForAggregate({ aggregateId, fromRevision = 1, toRevision = (2 ** 31) - 1 }) {
        if (fromRevision < 1) {
            throw new errors_1.errors.ParameterInvalid(`Parameter 'fromRevision' must be at least 1.`);
        }
        if (toRevision < 1) {
            throw new errors_1.errors.ParameterInvalid(`Parameter 'toRevision' must be at least 1.`);
        }
        if (fromRevision > toRevision) {
            throw new errors_1.errors.ParameterInvalid(`Parameter 'toRevision' must be greater or equal to 'fromRevision'.`);
        }
        const connection = await this.getDatabase();
        const passThrough = new stream_1.PassThrough({ objectMode: true });
        const domainEventStream = connection.query(`
      SELECT domainEvent
        FROM \`${this.tableNames.domainEvents}\`
        WHERE aggregateId = UuidToBin(?)
          AND revision >= ?
          AND revision <= ?
        ORDER BY revision`, [aggregateId, fromRevision, toRevision]);
        const unsubscribe = function () {
            // The listeners on domainEventStream should be removed here, but the
            // mysql typings unfortunately don't support that.
            MySqlDomainEventStore.releaseConnection({ connection });
        };
        const onEnd = function () {
            unsubscribe();
            passThrough.end();
        };
        const onError = function (err) {
            unsubscribe();
            passThrough.emit('error', err);
            passThrough.end();
        };
        const onResult = function (row) {
            const domainEvent = new DomainEvent_1.DomainEvent(JSON.parse(row.domainEvent));
            passThrough.write(domainEvent);
        };
        domainEventStream.on('end', onEnd);
        domainEventStream.on('error', onError);
        domainEventStream.on('result', onResult);
        return passThrough;
    }
    async getSnapshot({ aggregateIdentifier }) {
        const connection = await this.getDatabase();
        try {
            const [rows] = await runQuery_1.runQuery({
                connection,
                query: `SELECT state, revision
          FROM \`${this.tableNames.snapshots}\`
          WHERE aggregateId = UuidToBin(?)
          ORDER BY revision DESC
          LIMIT 1`,
                parameters: [aggregateIdentifier.aggregate.id]
            });
            if (rows.length === 0) {
                return;
            }
            return {
                aggregateIdentifier,
                revision: rows[0].revision,
                state: JSON.parse(rows[0].state)
            };
        }
        finally {
            MySqlDomainEventStore.releaseConnection({ connection });
        }
    }
    async storeDomainEvents({ domainEvents }) {
        var _a;
        if (domainEvents.length === 0) {
            throw new errors_1.errors.ParameterInvalid('Domain events are missing.');
        }
        const connection = await this.getDatabase();
        const parameters = [], placeholders = [];
        for (const domainEvent of domainEvents) {
            placeholders.push('(UuidToBin(?), ?, UuidToBin(?), UuidToBin(?), ?, ?)');
            parameters.push(domainEvent.aggregateIdentifier.aggregate.id, domainEvent.metadata.revision, domainEvent.metadata.causationId, domainEvent.metadata.correlationId, domainEvent.metadata.timestamp, JSON.stringify(domainEvent));
        }
        const query = `
      INSERT INTO \`${this.tableNames.domainEvents}\`
        (aggregateId, revision, causationId, correlationId, timestamp, domainEvent)
      VALUES
        ${placeholders.join(',')};
    `;
        try {
            await runQuery_1.runQuery({ connection, query, parameters });
        }
        catch (ex) {
            if (ex.code === 'ER_DUP_ENTRY' && ((_a = ex.sqlMessage) === null || _a === void 0 ? void 0 : _a.endsWith('for key \'PRIMARY\''))) {
                throw new errors_1.errors.RevisionAlreadyExists('Aggregate id and revision already exist.');
            }
            throw ex;
        }
        finally {
            MySqlDomainEventStore.releaseConnection({ connection });
        }
    }
    async storeSnapshot({ snapshot }) {
        const connection = await this.getDatabase();
        try {
            await runQuery_1.runQuery({
                connection,
                query: `INSERT IGNORE INTO \`${this.tableNames.snapshots}\`
          (aggregateId, revision, state)
          VALUES (UuidToBin(?), ?, ?);`,
                parameters: [
                    snapshot.aggregateIdentifier.aggregate.id,
                    snapshot.revision,
                    JSON.stringify(snapshot.state)
                ]
            });
        }
        finally {
            MySqlDomainEventStore.releaseConnection({ connection });
        }
    }
    async getAggregateIdentifiers() {
        const connection = await this.getDatabase();
        const passThrough = new stream_1.PassThrough({ objectMode: true });
        const domainEventStream = connection.query(`
      SELECT domainEvent, timestamp
        FROM \`${this.tableNames.domainEvents}\`
        WHERE revision = 1
        ORDER BY timestamp ASC
      `);
        const unsubscribe = function () {
            // Listeners should be removed here, but the mysql typings don't support
            // that.
            MySqlDomainEventStore.releaseConnection({ connection });
        };
        const onEnd = function () {
            unsubscribe();
            passThrough.end();
        };
        const onError = function (err) {
            unsubscribe();
            passThrough.emit('error', err);
            passThrough.end();
        };
        const onResult = function (row) {
            const domainEvent = new DomainEvent_1.DomainEvent(JSON.parse(row.domainEvent));
            passThrough.write(domainEvent.aggregateIdentifier);
        };
        domainEventStream.on('end', onEnd);
        domainEventStream.on('error', onError);
        domainEventStream.on('result', onResult);
        return passThrough;
    }
    async getAggregateIdentifiersByName({ contextName, aggregateName }) {
        const connection = await this.getDatabase();
        const passThrough = new stream_1.PassThrough({ objectMode: true });
        const domainEventStream = connection.query(`
      SELECT domainEvent, timestamp
        FROM \`${this.tableNames.domainEvents}\`
        WHERE revision = 1
        ORDER BY timestamp ASC
      `);
        const unsubscribe = function () {
            // Listeners should be removed here, but the mysql typings don't support
            // that.
            MySqlDomainEventStore.releaseConnection({ connection });
        };
        const onEnd = function () {
            unsubscribe();
            passThrough.end();
        };
        const onError = function (err) {
            unsubscribe();
            passThrough.emit('error', err);
            passThrough.end();
        };
        const onResult = function (row) {
            const domainEvent = new DomainEvent_1.DomainEvent(JSON.parse(row.domainEvent));
            if (domainEvent.aggregateIdentifier.context.name !== contextName ||
                domainEvent.aggregateIdentifier.aggregate.name !== aggregateName) {
                return;
            }
            passThrough.write(domainEvent.aggregateIdentifier);
        };
        domainEventStream.on('end', onEnd);
        domainEventStream.on('error', onError);
        domainEventStream.on('result', onResult);
        return passThrough;
    }
    async setup() {
        const connection = await this.getDatabase();
        const createUuidToBinFunction = `
      CREATE FUNCTION UuidToBin(_uuid CHAR(36))
        RETURNS BINARY(16)
        RETURN UNHEX(CONCAT(
          SUBSTR(_uuid, 15, 4),
          SUBSTR(_uuid, 10, 4),
          SUBSTR(_uuid, 1, 8),
          SUBSTR(_uuid, 20, 4),
          SUBSTR(_uuid, 25)
        ));
    `;
        try {
            await runQuery_1.runQuery({ connection, query: createUuidToBinFunction });
        }
        catch (ex) {
            // If the function already exists, we can ignore this error; otherwise
            // rethrow it. Generally speaking, this should be done using a SQL clause
            // such as 'IF NOT EXISTS', but MySQL does not support this yet. Also,
            // there is a ready-made function UUID_TO_BIN, but this is only available
            // from MySQL 8.0 upwards.
            if (!ex.message.includes('FUNCTION UuidToBin already exists')) {
                throw ex;
            }
        }
        const createUuidFromBinFunction = `
      CREATE FUNCTION UuidFromBin(_bin BINARY(16))
        RETURNS CHAR(36)
        RETURN LCASE(CONCAT_WS('-',
          HEX(SUBSTR(_bin,  5, 4)),
          HEX(SUBSTR(_bin,  3, 2)),
          HEX(SUBSTR(_bin,  1, 2)),
          HEX(SUBSTR(_bin,  9, 2)),
          HEX(SUBSTR(_bin, 11))
        ));
    `;
        try {
            await runQuery_1.runQuery({ connection, query: createUuidFromBinFunction });
        }
        catch (ex) {
            // If the function already exists, we can ignore this error; otherwise
            // rethrow it. Generally speaking, this should be done using a SQL clause
            // such as 'IF NOT EXISTS', but MySQL does not support this yet. Also,
            // there is a ready-made function BIN_TO_UUID, but this is only available
            // from MySQL 8.0 upwards.
            if (!ex.message.includes('FUNCTION UuidFromBin already exists')) {
                throw ex;
            }
        }
        const query = `
      CREATE TABLE IF NOT EXISTS \`${this.tableNames.domainEvents}\` (
        aggregateId BINARY(16) NOT NULL,
        revision INT NOT NULL,
        causationId BINARY(16) NOT NULL,
        correlationId BINARY(16) NOT NULL,
        timestamp BIGINT NOT NULL,
        domainEvent JSON NOT NULL,

        PRIMARY KEY (aggregateId, revision),
        INDEX (causationId),
        INDEX (correlationId),
        INDEX (timestamp)
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS \`${this.tableNames.snapshots}\` (
        aggregateId BINARY(16) NOT NULL,
        revision INT NOT NULL,
        state JSON NOT NULL,

        PRIMARY KEY (aggregateId, revision)
      ) ENGINE=InnoDB;
    `;
        await runQuery_1.runQuery({ connection, query });
        MySqlDomainEventStore.releaseConnection({ connection });
    }
    async destroy() {
        await new Promise((resolve, reject) => {
            this.pool.end((err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
}
exports.MySqlDomainEventStore = MySqlDomainEventStore;
//# sourceMappingURL=MySqlDomainEventStore.js.map