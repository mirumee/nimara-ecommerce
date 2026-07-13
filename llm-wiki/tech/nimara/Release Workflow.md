---
type: "Technical Reference"
title: "Release Workflow"
description: "Nimara's three-branch Git workflow — develop → staging → main — each mapped to a Vercel environment, and the automated tag/release/deploy that fires on merge to main."
tags:
  - "nimara"
  - "git"
  - "release"
  - "ci-cd"
  - "reference"
resource: "/sources/nimara-docs/release-workflow.md"
nimara_version: "2.0.x"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
---

## Content

> **Nimara version:** 2.0.x — these notes are synthesized from the archived [Nimara platform docs](/sources/nimara-docs/release-workflow.md) at this version. Re-synthesize them if the docs are bumped to a different Nimara version.

Nimara follows a three-branch Git workflow, each branch linked to its own Vercel environment (source: [release-workflow](/sources/nimara-docs/release-workflow.md)):

- **`develop`** — primary working branch for new features and bug fixes.
- **`staging`** — QA and testing before a release.
- **`main`** — production; stable, released code.

### 1. Daily development
Work from an up-to-date `develop`, branch per task (`feat/…` or `fix/…`), commit with [Conventional Commits](https://www.conventionalcommits.org/), push, and open a PR **into `develop`**.

```bash
git checkout develop && git pull origin develop
git checkout -b feat/my-new-feature
git commit -m "feat: my new feature"
git push origin feat/my-new-feature
```

### 2. Releasing to staging
When `develop` is ready for testing, merge it into `staging` and push — this triggers a Vercel staging deployment for full QA/regression.

```bash
git checkout staging && git pull origin staging
git merge develop && git push origin staging
```

### 3. Releasing to production
Open a PR to merge `staging` into `main`. On merge, **GitHub Actions automatically**:

- tags the latest `main` commit with a new version (e.g. `v1.2.3`),
- creates a GitHub Release from that tag,
- deploys to the Vercel production environment.

Afterwards, pull `main` back into `develop` so the working branch has all hotfixes/production changes (`git checkout develop && git pull origin main`).

The day-to-day command set and commit conventions are in [Local Development & Workflow](/tech/nimara/Local%20Development%20%26%20Workflow.md).

## Related Notes
[Nimara Platform (MOC)](/tech/nimara/Nimara%20Platform%20%28MOC%29.md)
[Local Development & Workflow](/tech/nimara/Local%20Development%20%26%20Workflow.md)
[Storefront](/tech/nimara/Storefront.md)
[Terraform Deployment](/tech/nimara/Terraform%20Deployment.md)
