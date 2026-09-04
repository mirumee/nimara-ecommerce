import { prepareServiceConfig } from "@nimara/lib/config/service";

import { appConfigSchema } from "@/domain/app-config";

import packageJson from "../../../package.json";

const parsed = prepareServiceConfig({
  moduleUrl: import.meta.url,
  pkg: packageJson,
  schema: appConfigSchema,
});

export const APP_CONFIG = {
  ...parsed,
  APP_ID: `${parsed.ENVIRONMENT}.${parsed.NAME}`,
};
