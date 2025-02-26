import * as Sentry from "@sentry/nextjs";

import { sentryCommonConfig } from "./sentry.common.config";

Sentry.init({
  ...sentryCommonConfig,
});
