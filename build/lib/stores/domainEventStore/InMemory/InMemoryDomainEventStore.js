"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryDomainEventStore = void 0;
const DomainEvent_1 = require("../../../common/elements/DomainEvent");
const errors_1 = require("../../../common/errors");
const lodash_1 = require("lodash");
const omitDeepBy_1 = require("../../../common/utils/omitDeepBy");
const stream_1 = require("stream");
class InMemoryDomainEventStore {
    constructor() {
        this.domainEvents = [];
        this.snapshots = [];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async create(options) {
        return new InMemoryDomainEventStore();
    }
    async getLastDomainEvent({ aggregateIdentifier }) {
        const storedDomainEvents = this.getStoredDomainEvents().filter((domainEvent) => domainEvent.aggregateIdentifier.aggregate.id === aggregateIdentifier.aggregate.id);
        const lastDomainEvent = lodash_1.last(storedDomainEvents);
        if (!lastDomainEvent) {
            return;
        }
        return lastDomainEvent;
    }
    async getDomainEventsByCausationId({ causationId }) {
        return stream_1.Readable.from(this.getStoredDomainEvents().
            filter((domainEvent) => domainEvent.metadata.causationId === causationId));
    }
    async hasDomainEventsWithCausationId({ causationId }) {
        return this.getStoredDomainEvents().
            some((domainEvent) => domainEvent.metadata.causationId === causationId);
    }
    async getDomainEventsByCorrelationId({ correlationId }) {
        return stream_1.Readable.from(this.getStoredDomainEvents().
            filter((domainEvent) => domainEvent.metadata.correlationId === correlationId));
    }
    async getReplay({ fromTimestamp = 0 }) {
        if (fromTimestamp < 0) {
            throw new errors_1.errors.ParameterInvalid(`Parameter 'fromTimestamp' must be at least 0.`);
        }
        const passThrough = new stream_1.PassThrough({ objectMode: true });
        const storedDomainEvents = this.getStoredDomainEvents().filter((domainEvent) => domainEvent.metadata.timestamp >= fromTimestamp);
        for (const domainEvent of storedDomainEvents) {
            passThrough.write(domainEvent);
        }
        passThrough.end();
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
        const passThrough = new stream_1.PassThrough({ objectMode: true });
        const storedDomainEvents = this.getStoredDomainEvents().filter((domainEvent) => domainEvent.aggregateIdentifier.aggregate.id === aggregateId &&
            domainEvent.metadata.revision >= fromRevision &&
            domainEvent.metadata.revision <= toRevision);
        for (const domainEvent of storedDomainEvents) {
            passThrough.write(domainEvent);
        }
        passThrough.end();
        return passThrough;
    }
    async getSnapshot({ aggregateIdentifier }) {
        const storedSnapshots = this.getStoredSnapshots().filter((snapshot) => snapshot.aggregateIdentifier.aggregate.id === aggregateIdentifier.aggregate.id);
        const newestSnapshotRevision = Math.max(...storedSnapshots.map((snapshot) => snapshot.revision));
        const newestSnapshot = storedSnapshots.
            find((snapshot) => snapshot.revision === newestSnapshotRevision);
        if (!newestSnapshot) {
            return;
        }
        return newestSnapshot;
    }
    async storeDomainEvents({ domainEvents }) {
        if (domainEvents.length === 0) {
            throw new errors_1.errors.ParameterInvalid('Domain events are missing.');
        }
        const storedDomainEvents = this.getStoredDomainEvents();
        for (const domainEvent of domainEvents) {
            const alreadyExists = storedDomainEvents.some((eventInDatabase) => domainEvent.aggregateIdentifier.aggregate.id === eventInDatabase.aggregateIdentifier.aggregate.id &&
                domainEvent.metadata.revision === eventInDatabase.metadata.revision);
            if (alreadyExists) {
                throw new errors_1.errors.RevisionAlreadyExists('Aggregate id and revision already exist.');
            }
            const savedDomainEvent = new DomainEvent_1.DomainEvent({
                ...domainEvent,
                data: omitDeepBy_1.omitDeepBy(domainEvent.data, (value) => value === undefined)
            });
            this.storeDomainEventAtDatabase({ domainEvent: savedDomainEvent });
        }
    }
    async storeSnapshot({ snapshot }) {
        this.storeSnapshotAtDatabase({
            snapshot: {
                ...snapshot,
                state: omitDeepBy_1.omitDeepBy(snapshot.state, (value) => value === undefined)
            }
        });
    }
    async getAggregateIdentifiers() {
        const aggregateIdentifiers = new Map();
        for (const domainEvent of this.getStoredDomainEvents()) {
            aggregateIdentifiers.set(domainEvent.aggregateIdentifier.aggregate.id, domainEvent.aggregateIdentifier);
        }
        return stream_1.Readable.from(aggregateIdentifiers.values());
    }
    async getAggregateIdentifiersByName({ contextName, aggregateName }) {
        const aggregateIdentifiers = new Map();
        for (const domainEvent of this.getStoredDomainEvents()) {
            if (domainEvent.aggregateIdentifier.context.name === contextName &&
                domainEvent.aggregateIdentifier.aggregate.name === aggregateName) {
                aggregateIdentifiers.set(domainEvent.aggregateIdentifier.aggregate.id, domainEvent.aggregateIdentifier);
            }
        }
        return stream_1.Readable.from(aggregateIdentifiers.values());
    }
    getStoredDomainEvents() {
        return this.domainEvents;
    }
    getStoredSnapshots() {
        return this.snapshots;
    }
    storeDomainEventAtDatabase({ domainEvent }) {
        this.domainEvents.push(domainEvent);
    }
    storeSnapshotAtDatabase({ snapshot }) {
        this.snapshots.push(snapshot);
    }
    // eslint-disable-next-line class-methods-use-this
    async setup() {
        // There is nothing to do here.
    }
    async destroy() {
        this.domainEvents = [];
        this.snapshots = [];
    }
}
exports.InMemoryDomainEventStore = InMemoryDomainEventStore;
//# sourceMappingURL=InMemoryDomainEventStore.js.map