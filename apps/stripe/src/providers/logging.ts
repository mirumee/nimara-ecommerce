import { getLoggingService } from "@nimara/infrastructure/logging/service";

export const getLoggingProvider = () => getLoggingService({ name: "stripe" });
