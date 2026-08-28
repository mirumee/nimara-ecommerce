---
type: "Implementation Record"
title: "Claude Pull Request Review Comment"
description: "Adds a GitHub Actions job that runs anthropics/claude-code-action on an opened or ready-for-review pull request and posts one short comment scoped to correctness, layer boundaries, and missing tests."
tags:
  - "implementation"
  - "github-actions"
  - "code-review"
  - "developer-experience"
created: "2026-08-28T00:00:00+00:00"
status: "in_progress"
owner: "engineering"
work_item:
  id: "800"
  url: "https://github.com/mirumee/nimara-ecommerce/pull/800"
relations:
  prds: []
  rfcs: []
  adrs: []
  product_records:
    - "[Claude Pull Request Review](../../operations/OPS-0010%20Claude%20Pull%20Request%20Review.md)"
  rolled_back_by: null
pull_requests:
  - "https://github.com/mirumee/nimara-ecommerce/pull/800"
verification:
  - criterion: "A pull request opened from a branch in this repository receives exactly one comment of at most 12 lines."
    tests: []
  - criterion: "A pull request from a fork, a draft, or a bot produces a skipped job and no comment."
    tests: []
  - criterion: "A repeated run updates the existing comment instead of adding a second one."
    tests: []
rollout: "Add a repository secret `ANTHROPIC_API_KEY` before merge. Without it the job fails and posts nothing. The workflow is not a required check, so a failure does not block a merge. No migration and no application configuration change is required."
rollback: "Disable the `Claude PR Review` workflow in the Actions tab, or revert the pull request. The job reads a diff and writes one comment, so it holds no state that a revert can strand. Revoking the API key in the Anthropic console stops all spend immediately."
---

# Implementation summary

`.github/workflows/claude-pr-review.yaml` runs `anthropics/claude-code-action@v1` on
`pull_request` `opened` and `ready_for_review`. The action checks out the pull request, so
Claude reads `CLAUDE.md` and `.claude/rules/` and judges the diff against the conventions of
this repository.

The prompt caps the comment at 12 lines and at three points, each one sentence. It limits the
scope to a correctness bug, a layer-boundary violation, or a missing test. It forbids
restating the diff, praise, and style notes. When nothing needs action, Claude writes one line
that says so.

`claude_args` pins the model to `claude-opus-5`, caps the session at 12 turns, and allows only
`gh pr diff`, `gh pr view`, and `gh pr comment`. The job requests `contents: read`, so Claude
cannot push commits from this workflow.

# Deviations

The action documentation shows `pull-requests: read` in its filtered-author example. That is
not enough. `gh pr comment` writes an issue comment, so the job also needs `issues: write`.

The example triggers on `synchronize` as well as `opened`. This workflow does not. A comment
on every push would be noisy and would multiply the cost across the life of a pull request.

# Verification evidence

The workflow cannot review its own pull request. GitHub runs a `pull_request` workflow from the
version of the file on the base branch, so the behavior is verified on the first pull request
opened after merge.

The job condition, the trigger list, and the permission set were validated by parsing the
workflow file. `anthropics/claude-code-action@v1` was confirmed as the current major-version
tag of the action.

# Related Notes

[Claude Pull Request Review](../../operations/OPS-0010%20Claude%20Pull%20Request%20Review.md)
