---
type: "Operational Record"
title: "Claude Pull Request Review"
description: "Operates the GitHub Actions job that posts a short Claude review comment on a pull request, including API key setup, cost control, prompt tuning, and failure diagnosis."
tags:
  - "operations"
  - "github-actions"
  - "code-review"
  - "runbook"
created: "2026-08-28T00:00:00+00:00"
status: "active"
owner: "engineering"
kind: "runbook"
relations:
  implementations:
    - "[Claude Pull Request Review Comment](../tech/implementation/IMP-0006%20Claude%20Pull%20Request%20Review%20Comment.md)"
  product_records: []
---

# Trigger

Use this procedure to install the Claude review job, to change what the comment covers, to
control its cost, or to diagnose a missing or failing review.

The job runs when a pull request is opened or marked ready for review. It posts one comment of
at most 12 lines.

# Preconditions

- Confirm that you hold the `admin` role on `mirumee/nimara-ecommerce`.
- Confirm that the organization holds an Anthropic account that can issue an API key.
- The job runs only on `mirumee/nimara-ecommerce`. Forks skip it.

# Procedure

## Install the API key

1. Open the Anthropic console and create an API key for this repository.
2. In GitHub, open Settings, then Secrets and variables, then Actions.
3. Add a repository secret named `ANTHROPIC_API_KEY` and paste the key.

The key is a secret and it spends money. Do not commit it and do not paste it into an issue or
a pull request.

## Change what the comment covers

1. Open `.github/workflows/claude-pr-review.yaml`.
2. Edit the `prompt` input. It holds the line limit, the point limit, and the list of subjects.
3. Keep the limits. Without them the comment grows until nobody reads it.

## Control the cost

Four settings hold the cost down. Change one at a time and observe the effect.

- The trigger list excludes `synchronize`, so a push to an open pull request costs nothing.
- The job condition skips forks, drafts, and bots.
- `--max-turns 12` caps one session.
- `--model` selects the model. `claude-opus-5` gives the best review quality.
  `claude-sonnet-5` costs less per token.

## Turn the job off

Open the Actions tab, select **Claude PR Review**, and disable the workflow. To stop all spend
at once, revoke the API key in the Anthropic console.

# Verification

The workflow cannot review its own pull request. GitHub runs a `pull_request` workflow from the
version of the file on the base branch.

To verify a change to this workflow, merge it, then open a pull request from a branch in this
repository. Confirm three things:

1. The comment appears and holds at most 12 lines.
2. A second run updates that comment instead of adding another.
3. A draft pull request produces a skipped job and no comment.

# Escalation

If no comment appears, check the following in order:

1. Open the Actions tab and confirm that the job ran. A skipped job means that the condition
   rejected the pull request. A fork, a draft, or a bot author is the expected cause.
2. An `authentication_error` in the job log means that `ANTHROPIC_API_KEY` is absent, wrong, or
   revoked.
3. A `403` on the comment step means that the permission block lost `issues: write`.
   `gh pr comment` writes an issue comment, not a review comment.
4. A `rate_limit_error` means that the account hit its Anthropic limit. Wait, or raise the
   limit in the console.

The job is not a required check and it blocks no merge. If it stays broken, disable the
workflow and open an issue. Do not hold a release for it.

# Related Notes

[Claude Pull Request Review Comment](../tech/implementation/IMP-0006%20Claude%20Pull%20Request%20Review%20Comment.md)
[Daily GitHub Summary Bot](OPS-0009%20Daily%20GitHub%20Summary%20Bot.md)
