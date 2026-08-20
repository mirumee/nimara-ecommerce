import "hono";

import { type Logger } from "@nimara/infrastructure/logging/types";

declare module "hono" {
  interface ContextVariableMap {
    logger: Logger;
  }

  interface HonoRequest {
    // Path prefix the app is mounted under (`""` at root).
    basePath: string;
    origin: string;
  }
}
