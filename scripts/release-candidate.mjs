import { execFileSync } from "node:child_process";

/**
 * Which deployment a tag promotes, for one project.
 *
 * A tag means "everything on main up to this commit is released", so a project
 * advances to the newest production build the tag names — not only to a build of
 * the tagged commit itself. Selecting by the tagged commit alone strands work:
 * a commit that touches one app leaves every other app's build skipped, and
 * those apps would then wait for some later tag whose commit happens to touch
 * them.
 *
 * The pre-flight and the promotion workflow both read this module. If they
 * selected differently, the pre-flight would report one candidate and the
 * workflow would promote another.
 */

const IN_FLIGHT = new Set(["BUILDING", "QUEUED", "INITIALIZING"]);
const FAILED = new Set(["ERROR", "BLOCKED", "DELETED"]);

const newestFirst = (a, b) => b.createdAt - a.createdAt;

/**
 * Every commit reachable from the tagged commit, itself included. Requires full
 * history: a shallow checkout knows only the tip and would reject every build.
 */
export const ancestorsOf = (sha) => {
  try {
    const out = execFileSync("git", ["rev-list", sha], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    });

    return new Set(out.trim().split("\n").filter(Boolean));
  } catch (error) {
    throw new Error(
      `Cannot list ancestors of ${sha}. The checkout needs full history ` +
        `(fetch-depth: 0). ${error.message}`,
    );
  }
};

/**
 * Deployments must be production-target, exclude custom environments, and carry
 * `{ id, sha, state, substate, createdAt, inspectorUrl }`. `id` and `substate`
 * may be null where the source does not expose them; the verdicts that need
 * them are then skipped rather than guessed.
 *
 * Verdicts: `wait` (the tagged commit is still building), `failed`, `promote`,
 * `current` (the candidate already serves), `blocked` (cannot be promoted
 * again), `none` (nothing the tag names is READY).
 */
export const chooseCandidate = ({
  deployments,
  taggedSha,
  ancestors,
  currentDeploymentId = null,
}) => {
  // The tagged commit's own build decides whether waiting is worthwhile. Once
  // it finishes it is by definition the newest build the tag names.
  const own = deployments
    .filter((d) => d.sha === taggedSha)
    .sort(newestFirst)
    .at(0);

  if (own && IN_FLIGHT.has(own.state)) {
    return { verdict: "wait", deployment: own };
  }

  if (own && FAILED.has(own.state)) {
    return { verdict: "failed", deployment: own };
  }

  const candidate = deployments
    .filter((d) => d.state === "READY" && ancestors.has(d.sha))
    .sort(newestFirst)
    .at(0);

  if (!candidate) {
    return { verdict: "none" };
  }

  if (currentDeploymentId && candidate.id === currentDeploymentId) {
    return { verdict: "current", deployment: candidate };
  }

  if (candidate.substate === "ROLLING") {
    return {
      verdict: "blocked",
      deployment: candidate,
      reason: "a rolling release is in progress; complete or abort it first",
    };
  }

  if (candidate.substate === "PROMOTED") {
    return {
      verdict: "blocked",
      deployment: candidate,
      reason:
        "this deployment has already served production and cannot be promoted " +
        "twice; use an instant rollback to reach it",
    };
  }

  return { verdict: "promote", deployment: candidate };
};

/**
 * True when the candidate comes from an earlier commit than the tag — the
 * project is catching up on work merged before this release.
 */
export const isCatchingUp = (deployment, taggedSha) =>
  Boolean(deployment) && deployment.sha !== taggedSha;
