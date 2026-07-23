---
id: release-workflow
title: Daily Workflow & Releasing
---

# Daily Workflow & Releasing

Nimara uses trunk-based development. `main` is the only long-lived branch, the source of releases,
and the Vercel production branch. Every commit on `main` must be safe to release.

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
pull requests, so this title becomes the commit semantic-release evaluates.

Before merging:

- Obtain the required approval and resolve review conversations.
- Pass `Linters & Tests` and all affected Vercel preview deployments.
- Bring the branch up to date with `main`.
- Complete risk-appropriate testing against the preview deployment.

GitHub squash-merges the change and deletes the branch. Do not commit directly to `main` except
through the documented break-glass incident procedure.

## Additional QA

Vercel preview deployments replace branch-based development environments. For high-risk changes,
use the **QA Deploy** workflow to deploy the exact commit SHA to `qa-1` or `qa-2`, then record that
SHA with the test evidence.

The QA environment is an additional validation surface, not a release branch or a place to
accumulate changes.

## Releasing

After a `main` push passes the full CI workflow:

- The Release workflow checks out that exact successful commit and runs semantic-release.
- Semantic-release determines whether the Conventional Commit history requires a version, tag, and
  GitHub release.
- Vercel independently builds each affected application from `main` and updates its production
  domain after a successful build.
- Documentation is published from the same commit after the Release workflow succeeds.

There is no release branch and no later promotion merge. A `main` commit that does not require a new
semantic version can still deploy.

## Production recovery

For an application regression:

1. Restore or promote the previous known-good Vercel deployment.
2. Open a revert or fix-forward pull request against `main`.
3. Run the normal required checks and release a new immutable version when applicable.

Never force-push `main`, move a published tag, or treat a deployment rollback as a rollback of
database migrations, Saleor changes, Stripe actions, provider data, or environment changes. Those
stateful changes require their own approved compensating procedure.
