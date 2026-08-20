import { z } from "zod";

import packageJson from "../../../package.json";

// Shared runtime settings every app in src/apps/* builds its config on.
export const baseConfigSchema = z.object({
  NAME: z.string().default(packageJson.name),
  VERSION: z.string().default(packageJson.version),
  ENVIRONMENT: z.string(),
  FETCH_TIMEOUT: z
    .number()
    .default(10000)
    .describe("Fetch timeout in milliseconds."),
  SENTRY_DSN: z.string().optional().describe("Sentry DSN, enables reporting."),
  BASE_PATH: z
    .string()
    .regex(
      /^(\/[^/\s]+)*$/,
      "BASE_PATH must be empty or a prefix like `/stripe`",
    )
    .default("")
    .describe(
      "Path prefix the app is served under. Empty at root; set per app in dev (`/<app>`) and via env for a sub-path deployment.",
    ),
});
