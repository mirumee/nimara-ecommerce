/**
 * Re-export Logger types from foundation to maintain backward compatibility.
 * The types are now defined in @nimara/foundation to break the circular dependency.
 */
export type {
    LogLevel,
    LogFn,
    Logger,
    LoggerService,
} from "@nimara/foundation/logging/types.js";
