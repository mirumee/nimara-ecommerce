// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { sentryCommonConfig } from "./sentry.common.config";

Sentry.init({
  ...sentryCommonConfig,

  integrations: [Sentry.captureConsoleIntegration({ levels: ["error"] })],
});
