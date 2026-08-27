export const TEMPLATE_NAME = "app-template";

export const TEMPLATE_SERVICE = "handler";

export const TEMPLATE_PORT = "8000";

const APP_NAME_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// `My Handler!` becomes `my-handler`. Idempotent, so it can be applied twice.
export const toDirectoryName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Rejects what normalising cannot save: empty, or starting with a digit.
export const validateName = (value: string) =>
  APP_NAME_PATTERN.test(toDirectoryName(value)) ||
  "Use letters and digits, e.g. `feed` or `order-sync`.";

export const BUILD_TARGETS = ["vercel", "node"] as const;

export type BuildTarget = (typeof BUILD_TARGETS)[number];

export const KINDS = ["dashboard", "http"] as const;

export type AppKind = (typeof KINDS)[number];

export const TENANCIES = ["multi", "single"] as const;

export type Tenancy = (typeof TENANCIES)[number];
