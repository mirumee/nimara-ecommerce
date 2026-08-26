import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { type PlopTypes } from "@turbo/gen";

import { createApp } from "./src/create-app.ts";
import {
  BUILD_TARGETS,
  type BuildTarget,
  toDirectoryName,
  validateName,
} from "./src/names.ts";

type Answers = {
  description: string;
  name: string;
  port: string;
  target: BuildTarget;
  turbo: { paths: { root: string } };
};

const run =
  (root: string) =>
  (...args: string[]) =>
    execFileSync("pnpm", args, { cwd: root, stdio: "inherit" });

// eslint-disable-next-line import/no-default-export
export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("saleor-app", {
    description: "Scaffold a Saleor app from the template",
    prompts: [
      {
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
      },
      {
        message: "Description (shown in the Saleor dashboard):",
        name: "description",
        type: "input",
        validate: (input: string) =>
          input.trim().length > 0 || "A description is required.",
      },
      {
        choices: [...BUILD_TARGETS],
        default: "vercel",
        message: "What is the deployment target?",
        name: "target",
        type: "list",
      },
      {
        default: "8000",
        message: "Dev server port:",
        name: "port",
        type: "input",
        validate: (input: string) =>
          /^\d{4,5}$/.test(input) || "Give a port number, e.g. 8010.",
      },
    ],
    actions: [
      async (answers) => {
        const { description, name, port, target, turbo } = answers as Answers;

        const destination = await createApp({
          description,
          name,
          port,
          root: turbo.paths.root,
          target,
        });

        const pnpm = run(turbo.paths.root);

        // `--no-frozen-lockfile`: CI freezes it by default, and a new
        // workspace package is exactly what the lockfile does not have yet.
        pnpm("install", "--no-frozen-lockfile", "--silent");

        return `created ${destination}`;
      },
    ],
  });
}
