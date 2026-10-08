import { prepareCoreServiceConfig } from "@nimara/lib/config/service";

import packageJson from "../../../package.json";

export const APP_CONFIG = prepareCoreServiceConfig({
  moduleUrl: import.meta.url,
  pkg: packageJson,
});
