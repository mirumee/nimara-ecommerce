/**
 * Runs the dev task for one app: `pnpm dev [app]`. Apps are discovered from
 * `apps/*`, so a generated one needs no script of its own.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";

const target = process.argv[2] ?? "storefront";

const apps = readdirSync("apps", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => `apps/${entry.name}/package.json`)
  .filter(existsSync)
  .map((path) => JSON.parse(readFileSync(path, "utf8")).name);

// Matches with or without a workspace scope.
const match = apps.find(
  (name) => name === target || name.split("/").at(-1) === target,
);

if (!match) {
  const available = apps.map((name) => name.split("/").at(-1)).join(", ");

  console.error(`Unknown app "${target}". Available: ${available}`);
  process.exit(1);
}

const { status } = spawnSync(
  "pnpm",
  ["turbo", "run", "dev", `--filter=${match}`, "--log-prefix=none"],
  { shell: process.platform === "win32", stdio: "inherit" },
);

process.exit(status ?? 0);
