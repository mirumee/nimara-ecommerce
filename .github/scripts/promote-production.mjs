#!/usr/bin/env node

/**
 * Promotes production for every project a release tag names.
 *
 * A project advances to the newest production build reachable from the tagged
 * commit, which is not necessarily a build of that commit: a commit touching one
 * app leaves the other apps' builds skipped, and those apps must still catch up
 * on work merged earlier. See scripts/release-candidate.mjs.
 *
 * Every project is resolved before any project is promoted. Promoting as each
 * build finishes would leave production split across versions whenever a later
 * build fails.
 */

import {
  ancestorsOf,
  chooseCandidate,
  isCatchingUp,
} from "../../scripts/release-candidate.mjs";
import { PRODUCTION_PROJECTS } from "../../scripts/production-projects.mjs";

const API = "https://api.vercel.com";
const POLL_INTERVAL_MS = 15_000;

const token = requireEnv("VERCEL_TOKEN");
const teamId = requireEnv("VERCEL_ORG_ID");

const { sha, projects, timeoutMs } = parseArgs(process.argv.slice(2));

const deadline = Date.now() + timeoutMs;
const ancestors = ancestorsOf(sha);

const resolved = await Promise.all(
  projects.map((name) => resolveProject(name)),
);
const decided = await Promise.all(resolved.map((project) => settle(project)));

const pending = decided.filter(({ verdict }) => verdict === "promote");

for (const { project, deployment, verdict } of decided) {
  if (verdict === "current") {
    log(
      `${project.name}: already serving ${short(deployment.sha)}, nothing to do.`,
    );
  }
}

for (const { project, deployment } of pending) {
  const note = isCatchingUp(deployment, sha)
    ? ` (catching up from ${short(deployment.sha)}, merged before this tag)`
    : "";

  log(`${project.name}: will promote ${short(deployment.sha)}${note}.`);
}

if (pending.length === 0) {
  log("Nothing to promote. Every project already serves what this tag names.");
  await writeSummary(decided);
  process.exit(0);
}

const promoted = [];

try {
  for (const candidate of pending) {
    await promote(candidate);
    promoted.push(candidate);
  }
} catch (error) {
  const done = promoted.map(({ project }) => project.name).join(", ");
  const missed = pending
    .filter((candidate) => !promoted.includes(candidate))
    .map(({ project }) => project.name)
    .join(", ");

  log("");
  log(`Promotion failed after promoting: ${done || "nothing"}`);
  log(`Not promoted: ${missed}`);
  log(
    "Production may serve mixed versions. Promote the remaining projects from " +
      "the Vercel dashboard, or roll the promoted ones back to the previous " +
      "deployment.",
  );

  throw error;
}

await writeSummary(decided);

async function resolveProject(name) {
  const project = await api(`/v9/projects/${encodeURIComponent(name)}`);

  return {
    id: project.id,
    name: project.name,
    currentDeploymentId: project.targets?.production?.id ?? null,
  };
}

/**
 * Polls until this project's verdict is terminal, then returns it.
 */
async function settle(project) {
  for (;;) {
    const deployments = await productionDeployments(project);

    const decision = chooseCandidate({
      deployments,
      taggedSha: sha,
      ancestors,
      currentDeploymentId: project.currentDeploymentId,
    });

    switch (decision.verdict) {
      case "wait":
        log(
          `${project.name}: build for ${short(sha)} is ${decision.deployment.state}, waiting.`,
        );
        break;

      case "failed":
        throw new Error(
          `${project.name}: build for ${short(sha)} is ${decision.deployment.state}. ` +
            `Inspect ${decision.deployment.inspectorUrl ?? "the Vercel dashboard"}.`,
        );

      case "blocked":
        throw new Error(
          `${project.name}: cannot promote ${decision.deployment.uid} — ${decision.reason}.`,
        );

      case "none":
        throw new Error(
          `${project.name}: no READY production build is reachable from ${short(sha)}. ` +
            "Check the project's deployments in the Vercel dashboard.",
        );

      default:
        return { project, ...decision };
    }

    if (Date.now() >= deadline) {
      throw new Error(
        `${project.name}: build for ${short(sha)} did not finish within the timeout.`,
      );
    }

    await sleep(POLL_INTERVAL_MS);
  }
}

/**
 * The tagged commit's own build in any state, plus READY history for ancestor
 * selection. Filtering READY server-side keeps skipped builds from crowding the
 * window and hiding an older build the tag still names.
 */
async function productionDeployments(project) {
  const [own, ready] = await Promise.all([
    api("/v6/deployments", {
      projectId: project.id,
      target: "production",
      sha,
      limit: "20",
    }),
    api("/v6/deployments", {
      projectId: project.id,
      target: "production",
      state: "READY",
      limit: "100",
    }),
  ]);

  const seen = new Set();

  // Every commit on main also builds the `stage` custom environment, which
  // carries the stage Saleor and Stripe configuration. Promoting one of those
  // would serve stage's backends from a production domain.
  return [...own.deployments, ...ready.deployments]
    .filter(
      ({ target, customEnvironment }) =>
        target === "production" && !customEnvironment,
    )
    .filter(({ uid }) => !seen.has(uid) && seen.add(uid))
    .map((d) => ({
      id: d.uid,
      uid: d.uid,
      sha: d.meta?.githubCommitSha ?? null,
      state: d.readyState ?? d.state,
      substate: d.readySubstate ?? null,
      createdAt: d.createdAt,
      inspectorUrl: d.inspectorUrl,
    }));
}

async function promote({ project, deployment }) {
  log(`${project.name}: promoting ${deployment.uid}.`);

  await api(
    `/v10/projects/${project.id}/promote/${deployment.uid}`,
    {},
    { method: "POST" },
  );

  for (;;) {
    const current = await api(`/v9/projects/${project.id}`);

    if (current.targets?.production?.id === deployment.uid) {
      log(`${project.name}: promoted.`);

      return;
    }

    if (Date.now() >= deadline) {
      throw new Error(
        `${project.name}: promotion of ${deployment.uid} did not complete within the timeout.`,
      );
    }

    await sleep(POLL_INTERVAL_MS);
  }
}

async function api(path, searchParams = {}, init = {}) {
  const url = new URL(path, API);

  url.searchParams.set("teamId", teamId);

  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(
      `${init.method ?? "GET"} ${path} returned ${response.status}: ${await response.text()}`,
    );
  }

  return response.status === 204 ? null : response.json();
}

async function writeSummary(results) {
  const file = process.env.GITHUB_STEP_SUMMARY;

  if (!file) {
    return;
  }

  const rows = results.map(({ project, deployment, verdict }) => {
    const outcome = verdict === "promote" ? "Promoted" : "Already current";
    const catching = isCatchingUp(deployment, sha) ? " ⤴ caught up" : "";

    return `| ${project.name} | ${outcome}${catching} | \`${short(deployment.sha)}\` | \`${deployment.uid}\` |`;
  });

  const { appendFile } = await import("node:fs/promises");

  await appendFile(
    file,
    [
      `### Production after \`${short(sha)}\``,
      "",
      "Each row is the commit that project now serves — not necessarily the tagged commit.",
      "",
      "| Project | Outcome | Serving commit | Deployment |",
      "| --- | --- | --- | --- |",
      ...rows,
      "",
    ].join("\n"),
  );
}

function parseArgs(argv) {
  const values = new Map();
  const projects = [];

  for (const arg of argv) {
    const [key, value] = arg.replace(/^--/, "").split("=");

    if (key === "project") {
      projects.push(value);
    } else {
      values.set(key, value);
    }
  }

  const commit = values.get("sha");

  if (!commit) {
    throw new Error(
      "Usage: promote-production.mjs --sha=<commit> [--project=<name>] [--timeout=<seconds>]",
    );
  }

  return {
    sha: commit,
    // --project narrows the set for a manual recovery run; a release promotes
    // every project the pre-flight checked.
    projects: projects.length > 0 ? projects : PRODUCTION_PROJECTS,
    timeoutMs: Number(values.get("timeout") ?? 1_800) * 1_000,
  };
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function short(value) {
  return value ? value.slice(0, 8) : "unknown";
}

function log(message) {
  process.stdout.write(`${message}\n`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
