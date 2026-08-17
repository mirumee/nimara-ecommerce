---
id: release-workflow
title: Daily Workflow & Releasing
---

# Daily Workflow & Releasing

Nimara uses trunk-based development. `main` is the only long-lived branch, the source of releases,
and the Vercel production branch. Every commit on `main` must be safe to release.

Merging to `main` builds production but does not serve it. A release is a hand-pushed `vX.Y.Z` tag,
and that tag is what points the production domains at the commit's builds.

## Daily development

Start each change from the latest `main`:

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/my-new-feature
```

Keep the branch focused on one releasable change and aim to merge it within two working days.
Several pull requests can serve one issue or story. Do not use a shared feature branch as an
integration branch.

For work that cannot be completed in that window:

- Split it into backward-compatible slices.
- Hide incomplete behavior behind a short-lived, default-off feature flag.
- Use branch by abstraction for a longer replacement or migration.
- Give every flag an owner and removal condition, and test each meaningful state.

## Pull requests

Open every pull request against `main` and use a Conventional Commit title. Nimara squash-merges
pull requests, so this title becomes one line of the next release's notes.

Before merging:

- Obtain the required approval and resolve review conversations.
- Pass `Linters & Tests` and the four Vercel project statuses:
  `Vercel – nimara-docs`, `Vercel – nimara-ecommerce`,
  `Vercel – nimara-ecommerce-stripe`, and `Vercel – nimara-marketplace`.
- Bring the branch up to date with `main`.
- Complete risk-appropriate testing against the preview deployment.

GitHub squash-merges the change and deletes the branch. Direct pushes to `main` have no bypass.
During an active incident, only a member of the GitHub `Admins` team may use the ruleset's
pull-request-only bypass. Keep the change in a PR, use a squash merge, and record the actor, reason,
exact SHA, skipped requirements, and recovery owner in the incident record.

## Additional QA

Preview deployments cover per-branch validation and the stage domains cover trunk validation, so
there is no separate QA environment to deploy to. Record the exact SHA with the test evidence, and
use the deployment's own immutable URL when the evidence must point at one build rather than
whatever the branch or stage domain serves now.

## Environments

Each application project tracks `main` twice, so one merge produces two builds of the same commit:

| Environment                  | Source                    | Backends                       |
| ---------------------------- | ------------------------- | ------------------------------ |
| Preview                      | feature branch            | stage                          |
| `stage` (custom environment) | `main`, every push        | stage Saleor, Stripe test      |
| Production                   | `main`, promoted by a tag | production Saleor, Stripe live |

The two `main` builds differ in configuration, not code. `stage` carries its own environment
variables, so it reaches the stage backends and renders its own canonical URLs. Promotion never
touches `stage`: it keeps following the tip of `main`.

Each project's own domains:

| Project                   | Production                                | `stage`                                    |
| ------------------------- | ----------------------------------------- | ------------------------------------------ |
| `nimara-ecommerce`        | `demo.nimara.store`                       | `stage.nimara.store`                       |
| `nimara-marketplace`      | `marketplace.nimara.store`                | `marketplace.stage.nimara.store`           |
| `nimara-ecommerce-stripe` | `nimara-ecommerce-demo-stripe.vercel.app` | `nimara-ecommerce-stage-stripe.vercel.app` |

`demo` denotes production throughout — the storefront domain, the `nimara-demo` Saleor instance, and
the payment app. It is not a sandbox.

The payment app's domains are `.vercel.app` names, but they are project domains like any other and a
promotion moves them. Do not confuse either with `nimara-ecommerce-stripe-mirumee.vercel.app`, which
is the generated alias: it is not a project domain, so it is never held back and always serves the
newest build, promoted or not. The same is true of every `<project>-mirumee.vercel.app` alias. Point
integrations, webhooks, and monitoring at a project domain, never at a generated alias.

## After a merge

A `main` push builds but does not go live:

- CI runs `Linters & Tests` on the merge commit.
- Vercel builds the `stage` environment and publishes it to the stage domains immediately.
- Vercel also builds the Production environment and leaves it **Staged**, because every project has
  **Auto-assign Custom Production Domains** turned off. The production domains keep serving the last
  promoted tag.
- Documentation publishes from the commit once CI succeeds.

Verify the change on the stage domains, where the backends are safe to exercise.

Then read the staged production deployment's own URL before tagging. It is a different build from
the one you tested: same code, but production environment variables that `stage` never exercised, so
it is where a wrong backend URL or a missing production variable shows up. It talks to the
production Saleor and live Stripe, so keep those checks read-only — browse, search, a product page.
Never place a test order against it.

## Releasing

Versions are assigned by hand. Nothing in CI creates a tag, and nothing computes the next number
for you — read the Conventional Commit titles merged since the last tag and pick the version they
imply.

```bash
git switch main
git pull --ff-only origin main
pnpm release v1.4.0
```

`pnpm release` runs the pre-flight before it creates anything: you are on `main` with a clean tree
matching `origin`, the version is well formed and above the previous tag, the tag does not already
exist locally or on `origin`, `Linters & Tests` passed for this exact commit, and every project has a
promotable build. It names the commit each project would promote, prints the commits since the
previous tag, asks for confirmation, then creates the annotated tag and pushes it.

The two checks that matter most are the last two. Tagging a commit whose builds are unfinished
stalls the promotion workflow until it times out, and a published tag must never be moved.

Run it from your own machine. A tag created by a workflow would carry `GITHUB_TOKEN`, and GitHub
does not start new workflow runs from that token, so the release would never fire.

`--skip-vercel` drops the build check when the Vercel CLI is unavailable; `--yes` skips the
confirmation prompt. A failed pre-flight creates nothing, so re-running after a fix is safe.

The **Release** workflow then:

1. Resolves one candidate per project and waits for any build of the tagged commit that is still
   running. A project's candidate is the **newest production build reachable from the tagged
   commit**, which is often not a build of that commit.
2. Promotes all three once every one of them is ready. Promotion re-points domains at an existing
   build, so nothing is rebuilt and the build you read on its staged URL is the one served. Holding
   the promotion until every project is ready keeps a late build failure from splitting production
   across two versions.
3. Publishes a GitHub release for the tag with generated notes, only after promotion succeeded.

There is no release branch and no promotion merge. Tag only a commit that is already staged and
verified; the workflow waits for a build in progress but will not invent one.

### A tag closes the backlog

Vercel skips a project's build when the commit does not affect it, so most commits produce a build
for one project and nothing for the others. A tag therefore means _everything on `main` up to this
commit is released_, and each project advances to the newest build the tag reaches — catching up on
work merged before this release.

Selecting by the tagged commit alone would strand that work: a project whose build was skipped would
wait for some later tag whose commit happened to touch it, while the release notes already claimed
its change had shipped. The workflow reports every catch-up explicitly, and its summary lists the
commit each project ends up serving.

That is also why production is a set of per-project commits rather than one version. `v2.9.0` names
the release, not the code every project runs — read the workflow summary for that, and roll back per
project to a previous deployment rather than to a tag.

## Production recovery

For an application regression:

1. Instant-roll-back each affected Vercel project to the previous known-good deployment. Use
   rollback, not promotion: a deployment that has already served production cannot be promoted a
   second time.
2. Open a revert or fix-forward pull request against `main`.
3. Run the normal required checks, then tag a new version to promote the fix.

Never force-push `main`, move a published tag, or treat a deployment rollback as a rollback of
database migrations, Saleor changes, Stripe actions, provider data, or environment changes. Those
stateful changes require their own approved compensating procedure.
