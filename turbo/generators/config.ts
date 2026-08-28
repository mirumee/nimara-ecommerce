import { execFileSync } from "node:child_process";

import { type PlopTypes } from "@turbo/gen";

import { createApp } from "./src/create-app.ts";
import { createService } from "./src/create-service.ts";
import { type AppKind, type BuildTarget, type Tenancy } from "./src/names.ts";
import * as prompts from "./src/prompts.ts";

type Answers = {
  description: string;
  kind: AppKind;
  name: string;
  port: string;
  service: string;
  target: BuildTarget;
  tenancy: Tenancy;
  turbo: { paths: { root: string } };
};

type ServiceAnswers = {
  app: string;
  kind: AppKind;
  name: string;
  turbo: { paths: { root: string } };
};

const run =
  (root: string) =>
  (...args: string[]) =>
    execFileSync("pnpm", args, { cwd: root, stdio: "inherit" });

// eslint-disable-next-line import/no-default-export
export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("app", {
    description: "Scaffold a Saleor app from the template",
    prompts: [
      prompts.appName,
      prompts.description,
      prompts.tenancy,
      prompts.target,
      prompts.kind,
      prompts.service,
      prompts.port,
    ],
    actions: [
      async (answers) => {
        const {
          description,
          kind,
          name,
          port,
          service,
          target,
          tenancy,
          turbo,
        } = answers as Answers;

        const destination = await createApp({
          description,
          kind,
          name,
          port,
          root: turbo.paths.root,
          service,
          target,
          tenancy,
        });

        /**
         * `--no-frozen-lockfile`: CI freezes it by default, and a new workspace
         * package is exactly what the lockfile does not have yet.
         */
        run(turbo.paths.root)("install", "--no-frozen-lockfile", "--silent");

        return `created ${destination}`;
      },
    ],
  });

  plop.setGenerator("service", {
    description: "Add a service to an app that already exists",
    prompts: [prompts.app, prompts.kind, prompts.serviceName],
    actions: [
      async (answers) => {
        const { app, kind, name, turbo } = answers as ServiceAnswers;

        const serviceDir = await createService({
          app,
          kind,
          name,
          root: turbo.paths.root,
        });

        /**
         * Renaming the service reorders the `@/services/<name>/...` imports the
         * lint rules sort. Leaving that undone would hand back a workspace that
         * fails its own linter.
         */
        run(turbo.paths.root)("--filter", app, "lint");

        return `created ${serviceDir}`;
      },
    ],
  });
}
