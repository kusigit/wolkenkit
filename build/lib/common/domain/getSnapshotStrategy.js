"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnapshotStrategy = void 0;
const errors_1 = require("../errors");
const getSnapshotStrategy = function (snapshotStrategyConfiguration) {
    switch (snapshotStrategyConfiguration.name) {
        case 'lowest': {
            const { durationLimit, revisionLimit } = snapshotStrategyConfiguration.configuration;
            return ({ replayDuration, replayedDomainEvents }) => replayDuration >= durationLimit || replayedDomainEvents >= revisionLimit;
        }
        case 'revision': {
            const { revisionLimit } = snapshotStrategyConfiguration.configuration;
            return ({ replayedDomainEvents }) => replayedDomainEvents >= revisionLimit;
        }
        case 'duration': {
            const { durationLimit } = snapshotStrategyConfiguration.configuration;
            return ({ replayDuration }) => replayDuration >= durationLimit;
        }
        case 'always': {
            return () => true;
        }
        case 'never': {
            return () => false;
        }
        default: {
            throw new errors_1.errors.InvalidOperation();
        }
    }
};
exports.getSnapshotStrategy = getSnapshotStrategy;
//# sourceMappingURL=getSnapshotStrategy.js.map