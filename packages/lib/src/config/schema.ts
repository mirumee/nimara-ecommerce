import { z } from "zod";

import { getAppDisplayName } from "#root/config/utils";

// A package cannot read the package.json of the app consuming it.
export type PackageInfo = {
  author?: string;
  description?: string;
  name: string;
  version: string;
};

// Apps extend it: `z.object({ ... }).and(baseConfigSchema(pkg))`.
export const baseConfigSchema = (pkg: PackageInfo) =>
  z
    .object({
      ENVIRONMENT: z.string(),
      NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
      // Fail closed: an emptied allow list admits nobody, not everybody.
      ALLOWED_DOMAINS: z
        .preprocess(
          // Read straight off `process.env`, so the list arrives as one string.
          (value) =>
            typeof value === "string"
              ? value
                  .split(",")
                  .map((domain) => domain.trim().toLowerCase())
                  .filter(Boolean)
              : value,
          z.array(z.string()),
        )
        .default([])
        .describe(
          "Comma-separated Saleor domains allowed to install the app. Supports wildcards.",
        ),
      FETCH_TIMEOUT: z
        .number()
        .default(10000)
        .describe("Fetch timeout in milliseconds."),
      // Unset means the line is absent, not blank: a variable someone left
      // empty is a half-finished `.env`, and failing here says so.
      SENTRY_DSN: z
        .url()
        .trim()
        .optional()
        .describe("Sentry DSN, enables reporting."),
      VITE_SALEOR_APP_TOKEN: z
        .string()
        .trim()
        .min(1)
        .optional()
        .describe(
          "The token the Dashboard UI runs on outside the Saleor iframe.",
        ),
      BASE_PATH: z
        .string()
        .regex(
          /^(\/[^/\s]+)*$/,
          "BASE_PATH must be empty or a prefix like `/my-app`",
        )
        .default("")
        .describe(
          "Path prefix the app is served under. Empty at root; set per app in dev (`/<app>`) and via env for a sub-path deployment.",
        ),
    })
    .superRefine((data, ctx) => {
      if (data.NODE_ENV === "production" && data.VITE_SALEOR_APP_TOKEN) {
        ctx.addIssue({
          code: "custom",
          message:
            "VITE_SALEOR_APP_TOKEN is a development-only token and must not be set in production.",
          path: ["VITE_SALEOR_APP_TOKEN"],
        });
      }
    })
    .transform((data) => ({
      AUTHOR: pkg.author,
      DESCRIPTION: pkg.description,
      DISPLAY_NAME: getAppDisplayName(pkg.name),
      IS_DEVELOPMENT: data.NODE_ENV === "development",
      IS_PRODUCTION: data.NODE_ENV === "production",
      IS_TEST: data.NODE_ENV === "test",
      NAME: pkg.name,
      RELEASE: `${pkg.name}@${pkg.version}`.toLowerCase(),
      VERSION: pkg.version,
      ...data,
    }));
