import { prepareServiceConfig } from "@nimara/lib/config/service";

import { appConfigSchema } from "@/domain/app-config";

import packageJson from "../../../package.json";

export const APP_CONFIG = prepareServiceConfig({
  moduleUrl: import.meta.url,
  pkg: packageJson,
  schema: appConfigSchema,
});
