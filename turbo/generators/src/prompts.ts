import { existsSync } from "node:fs";
import { join } from "node:path";

import { type PlopTypes } from "@turbo/gen";

import { listApps } from "./create-service.ts";
import {
  type AppKind,
  BUILD_TARGETS,
  type BuildTarget,
  KINDS,
  kindsForTarget,
  TEMPLATE_SERVICES,
  TENANCIES,
  type Tenancy,
  toDirectoryName,
  validateName,
} from "./names.ts";
import { detectBuildTarget } from "./target.ts";

export const appName: PlopTypes.PromptQuestion = {
  filter: toDirectoryName,
  message: "App name (kebab-case, becomes apps/<name>):",
  name: "name",
  type: "input",
  validate: (input: string) => {
    const named = validateName(input);

    if (named !== true) {
      return named;
    }

    const name = toDirectoryName(input);

    return existsSync(join(process.cwd(), "apps", name))
      ? `apps/${name} already exists.`
      : true;
  },
};

export const description: PlopTypes.PromptQuestion = {
  message:
    "Description (goes to package.json, used later in the app manifest):",
  name: "description",
  type: "input",
  validate: (input: string) =>
    input.trim().length > 0 || "A description is required.",
};

export const tenancy: PlopTypes.PromptQuestion = {
  choices: [
    { name: "multi — installable by many Saleor instances", value: "multi" },
    {
      name: "single — serves the one Saleor named in ALLOWED_DOMAINS",
      value: "single",
    },
  ] satisfies { name: string; value: Tenancy }[],
  default: TENANCIES[0],
  message: "How many Saleor instances does it serve?",
  name: "tenancy",
  type: "list",
};

const KIND_LABELS: Record<AppKind, string> = {
  dashboard: "dashboard — HTTP, with a settings page in Saleor",
  event: "event — invoked by a schedule or another function, no HTTP",
  http: "http — HTTP only: webhooks and API",
  queue: "queue — an SQS consumer, no HTTP",
};

export const kind: PlopTypes.PromptQuestion = {
  /**
   * Plop matches a bypassed `--args` answer against `choices`, which here is a
   * function. Taking the answer as given leaves the pairing to `createApp` and
   * `createService`, which see both the kind and the target.
   */
  bypass: (input: string) => input,
  /**
   * Offers what the target can run. A new app answers `target` outright; a
   * service added later inherits what its app chose.
   */
  choices: (answers: { app?: string; target?: BuildTarget }) =>
    kindsForTarget(
      answers.target ??
        detectBuildTarget({ app: answers.app ?? "", root: process.cwd() }),
    ).map((value) => ({ name: KIND_LABELS[value], value })),
  default: KINDS[0],
  message: "What does the service serve?",
  name: "kind",
  type: "list",
};

export const target: PlopTypes.PromptQuestion = {
  choices: [...BUILD_TARGETS],
  default: BUILD_TARGETS[0],
  message: "Where does it run?",
  name: "target",
  type: "list",
};

// Asked separately from the app's own name: `src/services/<service>`.
export const service: PlopTypes.PromptQuestion = {
  default: (answers: { kind: AppKind }) => TEMPLATE_SERVICES[answers.kind],
  filter: toDirectoryName,
  message: "Service name (becomes src/services/<name>):",
  name: "service",
  type: "input",
  validate: validateName,
};

export const port: PlopTypes.PromptQuestion = {
  default: "8000",
  message: "Dev server port:",
  name: "port",
  type: "input",
  validate: (input: string) =>
    /^\d{4,5}$/.test(input) || "Give a port number, e.g. 8010.",
};

export const app: PlopTypes.PromptQuestion = {
  choices: listApps(process.cwd()),
  message: "Which app?",
  name: "app",
  type: "list",
};

export const serviceName: PlopTypes.PromptQuestion = {
  default: (answers: { kind: AppKind }) => TEMPLATE_SERVICES[answers.kind],
  filter: toDirectoryName,
  message: "Service name (becomes src/services/<name>):",
  name: "name",
  type: "input",
  validate: (input: string, answers: { app: string }) => {
    const named = validateName(input);

    if (named !== true) {
      return named;
    }

    const name = toDirectoryName(input);
    const path = join("apps", answers.app, "src", "services", name);

    return existsSync(join(process.cwd(), path))
      ? `${path} already exists.`
      : true;
  },
};
