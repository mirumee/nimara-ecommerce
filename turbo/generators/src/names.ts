import { VERCEL_UNSUPPORTED_TRIGGERS } from "@nimara/tooling/entry-points";

export const TEMPLATE_NAME = "app-template";

export const TEMPLATE_SERVICE = "handler";

export const TEMPLATE_QUEUE_SERVICE = "consumer";

export const TEMPLATE_EVENT_SERVICE = "event";

export const TEMPLATE_SERVICE_DIRS = [
  TEMPLATE_SERVICE,
  TEMPLATE_QUEUE_SERVICE,
  TEMPLATE_EVENT_SERVICE,
];

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

export const BUILD_TARGETS = ["node", "vercel"] as const;

export type BuildTarget = (typeof BUILD_TARGETS)[number];

export const KINDS = ["dashboard", "http", "queue", "event"] as const;

export type AppKind = (typeof KINDS)[number];

/**
 * Which of the template's services each kind is generated from. A queue or an
 * event service is not an HTTP one with parts removed — it is a different program.
 */
export const TEMPLATE_SERVICES = {
  dashboard: TEMPLATE_SERVICE,
  event: TEMPLATE_EVENT_SERVICE,
  http: TEMPLATE_SERVICE,
  queue: TEMPLATE_QUEUE_SERVICE,
} as const satisfies Record<AppKind, string>;

const NODE_ONLY_KINDS = new Set<AppKind>(VERCEL_UNSUPPORTED_TRIGGERS);

// Nothing on Vercel polls a queue or invokes a service directly, so neither runs there.
export const kindsForTarget = (target: BuildTarget): AppKind[] =>
  KINDS.filter((kind) => target !== "vercel" || !NODE_ONLY_KINDS.has(kind));

// `--args` skips the prompt that would have offered only what the target runs.
export const requireKindForTarget = ({
  kind,
  target,
}: {
  kind: AppKind;
  target: BuildTarget;
}) => {
  if (!kindsForTarget(target).includes(kind)) {
    throw new Error(`A ${kind} service cannot be deployed to ${target}.`);
  }
};

export const TENANCIES = ["multi", "single"] as const;

export type Tenancy = (typeof TENANCIES)[number];
