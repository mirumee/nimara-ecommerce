#!/usr/bin/env node

/**
 * Creates and pushes a release tag after checking that the tag can actually be
 * released.
 *
 * The tag must be pushed from a developer's machine: GitHub does not start
 * workflow runs from GITHUB_TOKEN events, so a tag created in CI would never
 * trigger the promotion. This script exists for the checks around that push,
 * not for `git tag` itself. Both failure modes it guards are silent — tagging a
 * commit Vercel has not finished building stalls the promotion workflow until it
 * times out, and a published tag must never be moved.
 */

import { execFile, execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { promisify } from "node:util";

import { PRODUCTION_PROJECTS, VERCEL_SCOPE } from "./production-projects.mjs";
import {
  ancestorsOf,
  chooseCandidate,
  isCatchingUp,
} from "./release-candidate.mjs";

const run = promisify(execFile);

const { version, autoConfirm, skipVercel } = parseArgs(process.argv.slice(2));

const failures = [];

await check("version number is well formed", () => {
  if (!/^v\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`"${version}" is not vMAJOR.MINOR.PATCH.`);
  }
});

await check("on main", () => {
  const branch = git("rev-parse", "--abbrev-ref", "HEAD");

  if (branch !== "main") {
    throw new Error(`on "${branch}". Release only from main.`);
  }
});

await check("working tree is clean", () => {
  if (git("status", "--porcelain")) {
    throw new Error("uncommitted changes present.");
  }
});

git("fetch", "origin", "main", "--tags", "--quiet");

await check("main matches origin", () => {
  const local = git("rev-parse", "HEAD");
  const remote = git("rev-parse", "origin/main");

  if (local !== remote) {
    throw new Error("local main and origin/main differ. Pull with --ff-only.");
  }
});

const sha = git("rev-parse", "HEAD");
const previous = previousTag();

await check(
  `${version} is new and above ${previous ?? "the first release"}`,
  () => {
    if (git("tag", "--list", version)) {
      throw new Error(`tag ${version} already exists locally.`);
    }

    if (git("ls-remote", "--tags", "origin", `refs/tags/${version}`)) {
      throw new Error(`tag ${version} already exists on origin.`);
    }

    if (previous && compareVersions(version, previous) <= 0) {
      throw new Error(`${version} does not come after ${previous}.`);
    }
  },
);

await check(`CI passed for ${sha.slice(0, 8)}`, async () => {
  const { stdout } = await run("gh", [
    "api",
    `repos/{owner}/{repo}/commits/${sha}/check-runs`,
    "--paginate",
    "--jq",
    '.check_runs[] | select(.name == "Linters & Tests") | [.started_at, .conclusion] | @tsv',
  ]);

  const runs = stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split("\t"))
    .sort(([a], [b]) => b.localeCompare(a));

  if (runs.length === 0) {
    throw new Error("no Linters & Tests run found for this commit.");
  }

  const [, conclusion] = runs[0];

  if (conclusion !== "success") {
    throw new Error(
      `the latest Linters & Tests run concluded "${conclusion}".`,
    );
  }
});

if (skipVercel) {
  note("skipped the Vercel build check (--skip-vercel)");
} else {
  let states = [];

  await check("every project has a promotable build", async () => {
    const ancestors = ancestorsOf(sha);

    states = await Promise.all(
      PRODUCTION_PROJECTS.map((project) => buildState(project, sha, ancestors)),
    );

    const blocked = states.filter(({ ready }) => !ready);

    if (blocked.length > 0) {
      throw new Error(
        `${blocked.length} project(s) not ready. Wait for the build, then tag.`,
      );
    }
  });

  for (const { project, detail } of states) {
    note(`${project}: ${detail}`);
  }
}

if (failures.length > 0) {
  process.stdout.write(`\n${failures.length} check(s) failed. Not tagging.\n`);
  process.exit(1);
}

process.stdout.write(`\nCommits since ${previous ?? "the beginning"}:\n`);
process.stdout.write(`${changelog(previous)}\n`);

if (
  !autoConfirm &&
  !(await confirm(`Tag ${sha.slice(0, 8)} as ${version} and push?`))
) {
  process.stdout.write("Aborted.\n");
  process.exit(1);
}

git("tag", "-a", version, "-m", version);
git("push", "origin", version);

process.stdout.write(
  `\nPushed ${version}. The Release workflow promotes production now.\n`,
);

/**
 * Reports the build a tag would promote, using the same selection as the
 * workflow. The verdict cannot say whether that build already serves production
 * — the CLI does not expose deployment ids — so the workflow decides that; this
 * only establishes that a promotable build exists and nothing is broken.
 */
async function buildState(project, commit, ancestors) {
  const deployments = [
    ...(await listProduction(project, ["--meta", `githubCommitSha=${commit}`])),
    ...(await listProduction(project, ["--status", "READY"])),
  ];

  const seen = new Set();

  const normalized = deployments
    // The `stage` custom environment also builds every main commit and must
    // never be mistaken for the candidate.
    .filter(
      ({ target, customEnvironment }) =>
        target === "production" && !customEnvironment,
    )
    .filter(({ url }) => !seen.has(url) && seen.add(url))
    .map((d) => ({
      id: null,
      sha: d.meta?.githubCommitSha ?? null,
      state: d.state,
      substate: null,
      createdAt: d.createdAt,
    }));

  const decision = chooseCandidate({
    deployments: normalized,
    taggedSha: commit,
    ancestors,
  });

  switch (decision.verdict) {
    case "promote": {
      const at = decision.deployment.sha.slice(0, 8);

      return isCatchingUp(decision.deployment, commit)
        ? {
            project,
            ready: true,
            detail: `will promote ${at}, merged before this tag.`,
          }
        : { project, ready: true, detail: `will promote ${at}.` };
    }

    case "wait":
      return {
        project,
        ready: false,
        detail: `build for this commit is still ${decision.deployment.state.toLowerCase()}.`,
      };

    case "failed":
      return { project, ready: false, detail: "build for this commit failed." };

    case "none":
      return {
        project,
        ready: false,
        detail: "no READY build reachable from this commit.",
      };

    default:
      return { project, ready: false, detail: decision.verdict };
  }
}

async function listProduction(project, extra) {
  const { stdout } = await run("vercel", [
    "list",
    project,
    "--scope",
    VERCEL_SCOPE,
    "--environment",
    "production",
    "--limit",
    "100",
    ...extra,
    "--json",
  ]);

  return JSON.parse(stdout).deployments ?? [];
}

async function check(label, assertion) {
  try {
    await assertion();
    process.stdout.write(`  ok    ${label}\n`);
  } catch (error) {
    process.stdout.write(`  FAIL  ${label}\n        ${error.message}\n`);
    failures.push(label);
  }
}

function note(message) {
  process.stdout.write(`        ${message}\n`);
}

function previousTag() {
  const tags = git("tag", "--list", "v*", "--sort=-v:refname");

  return tags ? tags.split("\n")[0] : null;
}

function changelog(from) {
  const range = from ? `${from}..HEAD` : "HEAD";

  return git("log", "--format=  %s", range) || "  (none)";
}

function compareVersions(a, b) {
  const parse = (value) => value.slice(1).split(".").map(Number);
  const left = parse(a);
  const right = parse(b);

  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) {
      return left[i] - right[i];
    }
  }

  return 0;
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    const answer = await rl.question(`\n${question} [y/N] `);

    return answer.trim().toLowerCase() === "y";
  } finally {
    rl.close();
  }
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function parseArgs(argv) {
  const flags = argv.filter((arg) => arg.startsWith("--"));
  const positional = argv.filter((arg) => !arg.startsWith("--"));
  const [requested] = positional;

  if (!requested) {
    throw new Error(
      "Usage: pnpm release <version> [--yes] [--skip-vercel]\n" +
        "Example: pnpm release v2.9.0",
    );
  }

  return {
    version: requested.startsWith("v") ? requested : `v${requested}`,
    autoConfirm: flags.includes("--yes"),
    skipVercel: flags.includes("--skip-vercel"),
  };
}
