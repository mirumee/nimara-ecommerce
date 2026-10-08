import { execFileSync } from "node:child_process";

import { type PlopTypes } from "@turbo/gen";

import { type ServiceTrigger } from "@nimara/tooling/entry-points";

import { createApp } from "./src/create-app.ts";
import { createService } from "./src/create-service.ts";
import {
  type AppKind,
  type BuildTarget,
  type Integration,
  type Tenancy,
} from "./src/names.ts";
import * as prompts from "./src/prompts.ts";

type Answers = {
  dashboard?: boolean;
  description: string;
  integration: Integration;
  name: string;
  port: string;
  service: string;
  target: BuildTarget;
  tenancy?: Tenancy;
  trigger?: ServiceTrigger;
  turbo: { paths: { root: string } };
};

// The trigger and dashboard prompts stand in for the old single `kind` choice.
const resolveKind = ({
  dashboard,
  trigger,
}: {
  dashboard?: boolean;
  trigger?: ServiceTrigger;
}): AppKind => {
  const effectiveTrigger = prompts.resolveTrigger({ trigger });

  if (effectiveTrigger !== "http") {
    return effectiveTrigger;
  }

  return dashboard ? "dashboard" : "http";
};

type ServiceAnswers = {
  app: string;
  dashboard?: boolean;
  name: string;
  trigger?: ServiceTrigger;
  turbo: { paths: { root: string } };
};

// Quiet unless it fails: install and lint have nothing to say when they pass.
const run =
  (root: string) =>
  (...args: string[]) => {
    try {
      execFileSync("pnpm", args, { cwd: root, stdio: "pipe" });
    } catch (error) {
      const { stderr, stdout } = error as { stderr?: Buffer; stdout?: Buffer };

      process.stderr.write(`\npnpm ${args.join(" ")} failed:\n`);
      process.stderr.write(stdout?.toString() ?? "");
      process.stderr.write(stderr?.toString() ?? "");

      throw error;
    }
  };

// eslint-disable-next-line import/no-default-export
export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("app", {
    description: "Scaffold a Saleor app from the template",
    prompts: [
      prompts.appName,
      prompts.description,
      prompts.target,
      prompts.trigger,
      prompts.service,
      prompts.integration,
      prompts.tenancy,
      prompts.dashboard,
      prompts.port,
    ],
    actions: [
      async (answers) => {
        const {
          dashboard,
          description,
          integration,
          name,
          port,
          service,
          target,
          tenancy,
          trigger,
          turbo,
        } = answers as Answers;

        const destination = await createApp({
          description,
          integration,
          kind: resolveKind({ dashboard, trigger }),
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
    prompts: [
      prompts.app,
      prompts.trigger,
      prompts.serviceName,
      prompts.dashboard,
    ],
    actions: [
      async (answers) => {
        const { app, dashboard, name, trigger, turbo } =
          answers as ServiceAnswers;

        const serviceDir = await createService({
          app,
          kind: resolveKind({ dashboard, trigger }),
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
