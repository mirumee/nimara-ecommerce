import { existsSync } from "node:fs";
import { join } from "node:path";

import { type PlopTypes } from "@turbo/gen";

import { type ServiceTrigger } from "@nimara/tooling/entry-points";

import { listApps } from "./create-service.ts";
import { detectIntegration } from "./integration.ts";
import {
  BUILD_TARGETS,
  type BuildTarget,
  type Integration,
  INTEGRATIONS,
  TEMPLATE_SERVICES,
  TENANCIES,
  type Tenancy,
  toDirectoryName,
  TRIGGERS,
  triggersForTarget,
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

export const integration: PlopTypes.PromptQuestion = {
  choices: [
    { name: "_blank — no Saleor integration at all", value: "blank" },
    {
      name: "Saleor — a Saleor app: manifest, webhooks, dashboard",
      value: "saleor",
    },
  ] satisfies { name: string; value: Integration }[],
  default: INTEGRATIONS[1],
  message: "What does it integrate with?",
  name: "integration",
  type: "list",
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
  when: (answers: { integration?: Integration }) =>
    answers.integration === "saleor",
};

/**
 * A new app answers `target` outright; a service added later has no `target`
 * prompt of its own, so it inherits what its app already chose.
 */
const resolveTarget = (answers: {
  app?: string;
  target?: BuildTarget;
}): BuildTarget =>
  answers.target ??
  detectBuildTarget({ app: answers.app ?? "", root: process.cwd() });

export const target: PlopTypes.PromptQuestion = {
  choices: [...BUILD_TARGETS],
  default: BUILD_TARGETS[0],
  message: "Where does it run?",
  name: "target",
  type: "list",
};

const TRIGGER_LABELS: Record<ServiceTrigger, string> = {
  event: "INVOKE",
  http: "HTTP",
  queue: "QUEUE",
};

// Vercel only runs HTTP, so this is skipped there instead of offered with one choice.
export const trigger: PlopTypes.PromptQuestion = {
  /**
   * Plop matches a bypassed `--args` answer against `choices`, which here is a
   * function. Taking the answer as given leaves the pairing to `createApp` and
   * `createService`, which see both the kind and the target.
   */
  bypass: (input: string) => input,
  choices: (answers: { app?: string; target?: BuildTarget }) =>
    triggersForTarget(resolveTarget(answers)).map((value) => ({
      name: TRIGGER_LABELS[value],
      value,
    })),
  default: TRIGGERS[0],
  message: "What triggers it?",
  name: "trigger",
  type: "list",
  when: (answers: { app?: string; target?: BuildTarget }) =>
    resolveTarget(answers) !== "vercel",
};

// Vercel forces the trigger prompt to be skipped, but it still only runs HTTP.
export const resolveTrigger = (answers: {
  trigger?: ServiceTrigger;
}): ServiceTrigger => answers.trigger ?? "http";

/**
 * A new app answers `integration` outright; a service added later has no
 * `integration` prompt of its own, so it inherits what its app already chose.
 */
const resolveIntegration = (answers: {
  app?: string;
  integration?: Integration;
}): Integration =>
  answers.integration ??
  detectIntegration(join(process.cwd(), "apps", answers.app ?? ""));

// Only an HTTP-triggered Saleor service has a Saleor dashboard to add a page to.
export const dashboard: PlopTypes.PromptQuestion = {
  choices: [
    { name: "Yes", value: true },
    { name: "No", value: false },
  ],
  default: false,
  message: "Add the Dashboard settings page?",
  name: "dashboard",
  type: "list",
  when: (answers: {
    app?: string;
    integration?: Integration;
    trigger?: ServiceTrigger;
  }) =>
    resolveTrigger(answers) === "http" &&
    resolveIntegration(answers) === "saleor",
};

// Asked separately from the app's own name: `src/services/<service>`.
export const service: PlopTypes.PromptQuestion = {
  // `dashboard` is answered later, but it never changes the service directory.
  default: (answers: { trigger?: ServiceTrigger }) =>
    TEMPLATE_SERVICES[resolveTrigger(answers)],
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
  // `dashboard` is answered later, but it never changes the service directory.
  default: (answers: { trigger?: ServiceTrigger }) =>
    TEMPLATE_SERVICES[resolveTrigger(answers)],
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
