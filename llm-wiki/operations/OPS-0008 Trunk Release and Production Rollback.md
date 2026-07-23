---
type: "Operational Record"
title: "Trunk Release and Production Rollback"
description: "Release-from-trunk procedure for validating main, verifying semantic-release and Vercel production, and restoring a prior immutable deployment."
tags:
  - "operations"
  - "release"
  - "rollback"
  - "github-actions"
  - "production"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-23T00:00:00+00:00"
id: "OPS-0008"
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

Use this procedure to verify a release from the `main` trunk, to validate the corresponding
semantic-release and Vercel production outcomes, or to restore service after a bad production
deployment without rewriting published Git history.

# Preconditions

- Select the exact candidate commit and confirm it reached `main` through a reviewed, squash-merged
  pull request from a short-lived change branch.
- Confirm the pull request passed `Linters & Tests`, all four Vercel project statuses
  (`nimara-docs`, `nimara-ecommerce`, `nimara-ecommerce-stripe`, and `nimara-marketplace`), and
  risk-appropriate testing. For additional QA, retain results against an exact SHA deployed to
  `qa-1` or `qa-2`.
- Record the candidate SHA, the previous known-good release tag and Vercel deployment,
  database/schema migrations, environment changes, and external provider changes.
- Define the rollback owner, decision threshold, communication channel, and every stateful
  component that cannot be restored by redeploying application code.

# Procedure

1. Observe the `Linters & Tests` push workflow for the candidate `main` SHA. A failure blocks the
   Release workflow and requires an immediate revert or fix-forward pull request.
2. After CI succeeds, observe the Release workflow. It checks out that exact SHA, installs the
   frozen dependency graph, and invokes semantic-release.
3. Record whether semantic-release produced no version or created a new immutable tag and GitHub
   release. The outcome must match the Conventional Commit history on `main`.
4. Observe each affected Vercel production deployment separately. Vercel deployment is driven by
   the Git integration, not by the Release workflow.
5. Verify the production commit, domains, runtime configuration, migrations, core flows,
   monitoring, and any GitHub tag/release. Keep the previous deployment available throughout the
   observation window.
6. Confirm the documentation workflow published the same successful `main` SHA when documentation
   changed.
7. If the deployment regresses, restore or promote the previous known-good Vercel deployment,
   communicate the rollback boundary, and immediately submit a revert or corrective pull request
   against `main`.

# Verification

- The successful CI run, Release workflow, Vercel deployment, and documentation deployment resolve
  to the intended `main` SHA.
- Required pull-request checks and risk-appropriate preview or QA tests passed; production smoke
  tests cover every affected product surface and external integration.
- Semantic-release completed once and either correctly produced no release or created one immutable
  version tag and matching GitHub release at the intended commit.
- Database, Saleor schema, Stripe/Connect, content/search providers, and environment values remain
  compatible with the deployed application.

# Escalation

- A direct or bypass push to `main` is a break-glass event. Confirm the actor, reason, exact SHA,
  checks, and recovery owner, then preserve that evidence in the incident record.
- The workflow runs `pnpm dlx semantic-release` without a repository-pinned semantic-release
  version. Investigate unexpected versioning or plugin behavior before retrying a failed release.
- Vercel can begin processing a `main` deployment independently of the post-merge GitHub workflow.
  If CI fails after production promotion, restore the prior Vercel deployment and fix `main`
  immediately through a reviewed pull request.
- For an application-only regression, restore the prior Vercel deployment or redeploy the last
  known-good immutable tag/SHA. Do not force-push `main`, move a published tag, or delete release
  evidence.
- A deployment rollback does not reverse database migrations, Saleor changes, Stripe actions,
  provider data, or environment rotation. Use the relevant operational record and an approved
  compensating plan for each stateful system.
- After restoring service, ship the corrective code through a reviewed pull request and create a
  new release when applicable; do not silently mutate a prior release artifact.

# Provenance

- This trunk release and rollback contract is anchored at exact implementation commit
  [`241c4bbfa932f0a672b9422aed98489aaba76d1c`](https://github.com/mirumee/nimara-ecommerce/tree/241c4bbfa932f0a672b9422aed98489aaba76d1c),
  including the
  [documented trunk workflow](https://github.com/mirumee/nimara-ecommerce/blob/241c4bbfa932f0a672b9422aed98489aaba76d1c/docs/03-Release-workflow.md),
  [main CI workflow](https://github.com/mirumee/nimara-ecommerce/blob/241c4bbfa932f0a672b9422aed98489aaba76d1c/.github/workflows/main.yaml),
  [CI-gated semantic-release workflow](https://github.com/mirumee/nimara-ecommerce/blob/241c4bbfa932f0a672b9422aed98489aaba76d1c/.github/workflows/release.yaml),
  and
  [commit-aware QA deployment](https://github.com/mirumee/nimara-ecommerce/blob/241c4bbfa932f0a672b9422aed98489aaba76d1c/.github/workflows/deploy.yaml).
