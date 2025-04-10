import { getLogger } from "@nimara/infrastructure/logging/service";

export const getLoggingProvider = () => getLogger({ name: "stripe" });
