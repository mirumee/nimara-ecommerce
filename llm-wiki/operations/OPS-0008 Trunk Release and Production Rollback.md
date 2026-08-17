---
type: "Operational Record"
title: "Trunk Release and Production Rollback"
description: "Release-from-trunk procedure for validating main, cutting a manual version tag that promotes staged Vercel deployments to production, and restoring a prior immutable deployment."
tags:
  - "operations"
  - "release"
  - "rollback"
  - "github-actions"
  - "production"
created: "2026-07-21T00:00:00+00:00"
status: "active"
owner: "release-engineering"
kind: "rollback"
relations:
  implementations: []
  product_records:
    - "[Swappable Storefront Search and Content Providers](../product/capabilities/CAP-0001%20Swappable%20Storefront%20Search%20and%20Content%20Providers.md)"
    - "[Marketplace Payable Ledger and Payout Batching](../product/capabilities/CAP-0002%20Marketplace%20Payable%20Ledger%20and%20Payout%20Batching.md)"
    - "[Guided Storefront Checkout](../product/capabilities/CAP-0003%20Guided%20Storefront%20Checkout.md)"
    - "[Marketplace Vendor Operations](../product/capabilities/CAP-0004%20Marketplace%20Vendor%20Operations.md)"
    - "[Agent-Compatible Commerce](../product/capabilities/CAP-0005%20Agent-Compatible%20Commerce.md)"
    - "[Storefront Discovery and Cart](../product/capabilities/CAP-0006%20Storefront%20Discovery%20and%20Cart.md)"
    - "[Customer Account Self-Service](../product/capabilities/CAP-0007%20Customer%20Account%20Self-Service.md)"
---

# Trigger

Use this procedure to cut a release from the `main` trunk, to verify the resulting production
promotion, or to restore service after a bad production deployment without rewriting published Git
history.

Merging to `main` does not release. Each application project tracks `main` twice, so one merge
produces two builds of the same commit: the `stage` custom environment, which publishes to the stage
domains immediately against the stage Saleor and Stripe test mode, and the Production environment,
which stays **Staged** because **Auto-assign Custom Production Domains** is disabled. The production
domains keep serving the previously promoted tag. A hand-pushed `vX.Y.Z` tag is the release event,
and it never touches `stage`.

# Preconditions

- Select the exact candidate commit and confirm it reached `main` through a reviewed, squash-merged
  pull request from a short-lived change branch.
- Confirm the pull request passed `Linters & Tests`, all four Vercel project statuses
  (`nimara-docs`, `nimara-ecommerce`, `nimara-ecommerce-stripe`, and `nimara-marketplace`), and
  risk-appropriate testing. Retain test evidence against a deployment's own immutable URL rather
  than a branch or stage domain, which move on.
- Verify the candidate on the stage domains, where the backends are safe to exercise, then read the
  staged production deployment's own URL for each affected project. The staged build is not the one
  tested on stage: it shares the code but carries production environment variables, so it is the
  only place a wrong backend URL or missing production variable appears before promotion. It reaches
  the production Saleor and live Stripe, so keep those checks read-only and place no test orders.
- Choose the version by reading the Conventional Commit titles merged since the previous tag. No
  tooling computes it.
- Record the candidate SHA, the previous known-good release tag and Vercel deployment,
  database/schema migrations, environment changes, and external provider changes.
- Define the rollback owner, decision threshold, communication channel, and every stateful
  component that cannot be restored by redeploying application code.

# Procedure

1. Observe the `Linters & Tests` push workflow for the candidate `main` SHA. A failure requires an
   immediate revert or fix-forward pull request, and the commit must not be tagged.
2. Confirm each project has a promotable candidate. Vercel skips a project's build when the commit
   does not affect it, so a project's candidate is the newest `READY` production build reachable
   from the tagged commit, which is often an earlier commit than the tag. A tag therefore releases
   everything on `main` up to it, and a project catching up on earlier work is expected, not an
   anomaly.
3. Run `pnpm release vX.Y.Z` from a local clone of the verified SHA. Its pre-flight re-checks the
   branch, tree, tag novelty and ordering, CI conclusion, and per-project build state, then creates
   and pushes the annotated tag. A failed pre-flight creates nothing. Never create the tag from a
   workflow: GitHub does not start workflow runs from `GITHUB_TOKEN` events, so a CI-created tag
   would not trigger the release.
4. Observe the Release workflow. It resolves a candidate for `nimara-ecommerce`,
   `nimara-ecommerce-stripe`, and `nimara-marketplace`, waits for any build of the tagged commit
   still running, promotes every project that is not already serving its candidate, then publishes
   the GitHub release. The barrier before promotion is deliberate: a late build failure must not
   leave production split across two versions. Record the workflow summary, which lists the commit
   each project ends up serving — production is a set of per-project commits, not one version.
5. Verify the promoted commit, domains, runtime configuration, migrations, core flows, monitoring,
   and the GitHub release. Keep the previous deployment available throughout the observation window.
6. Confirm the documentation workflow published the intended SHA when documentation changed.
7. If the deployment regresses, instant-roll-back the affected projects to the previous known-good
   deployment, communicate the rollback boundary, and immediately submit a revert or corrective
   pull request against `main`.

# Verification

- The CI run, the tag, and the documentation deployment resolve to the intended `main` SHA.
- Required pull-request checks and risk-appropriate preview or QA tests passed; production smoke
  tests cover every affected product surface and external integration.
- Each promoted project reports its candidate as **Current**, and the deployment id matches the one
  the workflow summary named. A project serving an earlier commit than the tag is correct where that
  commit is the newest build the tag reaches; a project still serving a commit the tag supersedes is
  not, and means the promotion did not complete.
- One immutable version tag and one matching GitHub release exist at the intended commit, and the
  release was published only after promotion succeeded.
- Database, Saleor schema, Stripe/Connect, content/search providers, and environment values remain
  compatible with the deployed application.

# Escalation

- Direct pushes to `main` have no bypass. During an active incident, only a member of the GitHub
  `Admins` team may use the ruleset's pull-request-only bypass. Keep the change in a PR, use a
  squash merge, and preserve the actor, reason, exact SHA, skipped requirements, and recovery owner
  in the incident record.
- If the Release workflow fails partway through promotion, production serves mixed versions. The
  workflow logs which projects were promoted and which were not. Either finish the promotion from
  the Vercel dashboard or roll the promoted projects back, then reconcile before tagging again.
- A deployment that has already served production cannot be promoted a second time. Recovering to
  an earlier release is an instant rollback, never a re-promotion, and re-tagging the same commit
  will not restore it.
- A tag pushed at a commit with no staged deployment stalls the workflow until its timeout. Delete
  the tag, wait for the builds, and tag again rather than forcing a rebuild into production.
- For an application-only regression, restore the prior Vercel deployment. Do not force-push
  `main`, move a published tag, or delete release evidence.
- A deployment rollback does not reverse database migrations, Saleor changes, Stripe actions,
  provider data, or environment rotation. Use the relevant operational record and an approved
  compensating plan for each stateful system.
- After restoring service, ship the corrective code through a reviewed pull request and tag a new
  version to promote it; do not silently mutate a prior release artifact.
