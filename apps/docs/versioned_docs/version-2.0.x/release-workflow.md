---
id: release-workflow
sidebar_position: 3
title: Daily Workflow & Releasing
---

# Daily Workflow & Releasing

This project follows a simple Git workflow based on three core branches: `develop`, `staging`, and `main`. Each branch is linked to a separate Vercel environment.

- `develop` is our primary working branch for new features and bug fixes.
- `staging` is used for quality assurance (QA) and testing before a release.
- `main` represents the production environment and stable, released code.

## 1. Daily Development

To start working, always make sure you're on the `develop` branch. Pull the latest changes to stay in sync with the team.

```bash
git checkout develop
git pull origin develop
```

When you start a new task, create a feature branch directly from `develop`. Use a clear naming convention, e.g., `feat/my-new-feature` or `fix/button-bug`.

```bash
git checkout -b feat/my-new-feature
```

Commit your changes frequently and push your feature branch to GitHub.

```bash
git add .
git commit -m "feat: my new feature"
git push origin feat/my-new-feature
```

When your feature is complete, open a Pull Request (PR) from your feature branch to `develop`.

## 2. Releasing to Staging

When the `develop` branch is ready for testing (e.g., all new features for a release cycle are merged), you should merge it into `staging`. This will trigger a new deployment on the Vercel staging environment.

First, make sure your local `staging` branch is up to date:

```bash
git checkout staging
git pull origin staging
```

Then, merge `develop` into `staging` and push the changes:

```bash
git merge develop
git push origin staging
```

The team can now perform full QA and regression testing on the staging environment.

## 3. Releasing to Production

Once the `staging` environment is stable and all tests have passed, it's time to release to production.

To do this, you will create a Pull Request on GitHub to merge `staging` into `main`.

**GitHub Actions will automatically:**

- Tag the latest commit on `main` with a new version (e.g., `v1.2.3`).
- Create a new **GitHub Release** based on that tag.
- Deploy the production-ready code to the Vercel production environment.

After the release is complete, remember to pull the latest changes from `main` back into `develop` to ensure your development branch is up-to-date with all hotfixes and production changes.

```bash
git checkout develop
git pull origin main
```
