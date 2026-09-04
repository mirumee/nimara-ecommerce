import { z } from "zod";

import { getAppDisplayName } from "#root/config/utils";
import { blankAsUnset } from "#root/zod/util";

// A package cannot read the package.json of the app consuming it.
export type PackageInfo = {
  author?: string;
  description?: string;
  name: string;
  version: string;
};

// Apps extend it: `z.object({ ... }).and(baseConfigSchema(pkg))`.
export const baseConfigSchema = (
  pkg: PackageInfo,
  { singleTenant = false }: { singleTenant?: boolean } = {},
) =>
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
      SENTRY_DSN: blankAsUnset(
        z.url().trim().optional().describe("Sentry DSN, enables reporting."),
      ),
      VITE_SALEOR_APP_TOKEN: blankAsUnset(
        z
          .string()
          .trim()
          .min(1)
          .optional()
          .describe(
            "A short-lived staff JWT with MANAGE_APPS, for running the Dashboard UI outside the Saleor iframe. Copy it from a real Dashboard session's Authorization header. A long-lived API token authenticates GraphQL fine but is not a JWT, so it will not verify here.",
          ),
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
      if (singleTenant && data.ALLOWED_DOMAINS.length !== 1) {
        ctx.addIssue({
          code: "custom",
          message:
            "ALLOWED_DOMAINS must name exactly one Saleor domain: this is a single-tenant app.",
          path: ["ALLOWED_DOMAINS"],
        });
      }

      // A pattern names no host, so there is nothing to read a tenant from.
      if (
        singleTenant &&
        data.ALLOWED_DOMAINS.some(
          (domain) => !z.hostname().safeParse(domain).success,
        )
      ) {
        ctx.addIssue({
          code: "custom",
          message:
            "ALLOWED_DOMAINS must be a domain, not a pattern: a single-tenant app has to name the Saleor it serves.",
          path: ["ALLOWED_DOMAINS"],
        });
      }

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
