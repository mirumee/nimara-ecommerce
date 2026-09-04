import { existsSync } from "node:fs";
import { join } from "node:path";

import { type PlopTypes } from "@turbo/gen";

import { listApps } from "./create-service.ts";
import {
  type AppKind,
  BUILD_TARGETS,
  KINDS,
  TEMPLATE_SERVICE,
  TENANCIES,
  type Tenancy,
  toDirectoryName,
  validateName,
} from "./names.ts";

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
  message: "Description (shown in the Saleor dashboard):",
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

export const kind: PlopTypes.PromptQuestion = {
  choices: [
    {
      name: "dashboard — HTTP, with a settings page in Saleor",
      value: "dashboard",
    },
    { name: "http — HTTP only: webhooks and API", value: "http" },
  ] satisfies { name: string; value: AppKind }[],
  default: KINDS[0],
  message: "What does the service serve?",
  name: "kind",
  type: "list",
};

export const target: PlopTypes.PromptQuestion = {
  choices: [...BUILD_TARGETS],
  default: BUILD_TARGETS[0],
  message: "What is the deployment target?",
  name: "target",
  type: "list",
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
  default: TEMPLATE_SERVICE,
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
