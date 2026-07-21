---
type: "Operational Record"
title: "Release Promotion and Production Rollback"
description: "Rollback-oriented procedure for promoting develop through staging to main, verifying semantic-release and production deployment, and restoring a prior immutable release."
tags:
  - "operations"
  - "release"
  - "rollback"
  - "github-actions"
  - "production"
created: "2026-07-21T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
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

Use this procedure to promote an approved release from `develop` through `staging` to `main`, to
verify the automated GitHub release and production deployment, or to restore service after a bad
production release without rewriting published Git history.

# Preconditions

- Select the exact candidate commit and confirm all intended changes are merged into `develop`.
- Require protected-branch review and successful pull-request checks. The lint/test workflow runs on
  pull requests and pushes to `develop` and `staging`, but it does not run on a push to `main`.
- Record current `develop`, `staging`, and `main` SHAs; the last known-good release tag and Vercel
  deployment; database/schema migrations; environment changes; and external provider changes.
- Complete risk-appropriate regression testing in staging, including checkout, marketplace,
  payments, agent API, customer account, and provider behavior affected by the candidate.
- Define the rollback owner, decision threshold, communication channel, and any stateful component
  that cannot be restored by redeploying application code.

# Procedure

1. Merge the release candidate into `staging` through a reviewed change. Wait for the staging
   lint/format/test workflow and the Vercel staging deployment associated with the protected branch.
2. Verify the deployed staging commit matches the candidate. Run the approved regression scope and
   retain results against that exact SHA, not merely the movable branch name.
3. Promote with a reviewed pull request from `staging` to `main`. Do not merge while required checks,
   operational migrations, provider changes, or rollback prerequisites are unresolved.
4. After merge, observe the Release workflow. It installs the frozen dependency graph and invokes
   semantic-release, which determines the version, creates the immutable tag, and publishes the
   GitHub release from `main` history.
5. Observe the production Vercel deployment separately. The release workflow does not itself build
   or deploy the applications; deployment depends on the Vercel Git integration and project
   configuration.
6. Verify the production commit, domain, runtime configuration, migrations, core flows, monitoring,
   and the GitHub tag/release. Keep the prior deployment available through the observation window.
7. Bring the released `main` history back into `develop` through the repository's normal reviewed
   integration path so later work includes release and hotfix commits.

# Verification

- The staging and production deployments resolve to the recorded candidate/main SHAs.
- Required pull-request and staging checks passed; production smoke tests cover every affected
  product surface and external integration.
- The release workflow completed once and produced one immutable version tag and matching GitHub
  release at the intended `main` commit.
- Vercel reports a successful production build/deployment independently of the GitHub release job.
- Database, Saleor schema, Stripe/Connect, content/search providers, and environment values remain
  compatible with the deployed application.

# Escalation

- A direct push to `main` starts semantic-release without the repository's lint/format/test workflow.
  Treat branch protection and successful PR checks as mandatory; stop release if that evidence is
  absent.
- The workflow runs `pnpm dlx semantic-release` without a repository-pinned semantic-release version.
  Investigate unexpected versioning or plugin behavior before retrying a failed release.
- For an application-only regression, restore the prior Vercel deployment or redeploy the last
  known-good immutable tag/SHA. Do not force-push `main`, move a published tag, or delete release
  evidence.
- A deployment rollback does not reverse database migrations, Saleor changes, Stripe actions,
  provider data, or environment rotation. Use the relevant operational record and an approved
  compensating plan for each stateful system.
- After restoring service, ship the corrective code through a reviewed hotfix and create a new
  release; do not silently mutate the prior release artifact.

# Provenance

- This release and rollback contract is anchored at exact commit
  [`75d6bc55edddf431adcc348009a1c226f77cc005`](https://github.com/mirumee/nimara-ecommerce/tree/75d6bc55edddf431adcc348009a1c226f77cc005),
  including the
  [documented branch promotion](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/docs/03-Release-workflow.md),
  [lint and test workflow](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/.github/workflows/main.yaml),
  and
  [semantic-release workflow](https://github.com/mirumee/nimara-ecommerce/blob/75d6bc55edddf431adcc348009a1c226f77cc005/.github/workflows/release.yaml).
