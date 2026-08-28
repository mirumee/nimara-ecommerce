---
type: "Implementation Record"
title: "Daily Summary Claude Comment"
description: "Adds an optional Claude-written comment above the sections of the daily GitHub summary posted to Slack, trimmed to titles and counts before the request and degraded to no comment on any failure."
tags:
  - "implementation"
  - "github-actions"
  - "slack"
  - "claude-api"
created: "2026-08-28T00:00:00+00:00"
status: "in_progress"
owner: "engineering"
work_item:
  id: "801"
  url: "https://github.com/mirumee/nimara-ecommerce/pull/801"
relations:
  prds: []
  rfcs: []
  adrs: []
  product_records:
    - "[Daily GitHub Summary Bot](../../operations/OPS-0009%20Daily%20GitHub%20Summary%20Bot.md)"
  rolled_back_by: null
pull_requests:
  - "https://github.com/mirumee/nimara-ecommerce/pull/801"
verification:
  - criterion: "The comment sits above the sections and does not replace the quiet-day message."
    tests:
      - ".github/scripts/daily-summary.test.mjs"
  - criterion: "Without ANTHROPIC_API_KEY the block layout is unchanged and the summary still posts."
    tests:
      - ".github/scripts/daily-summary.test.mjs"
  - criterion: "A failed Claude request logs a warning and the summary still reaches the channel."
    tests: []
  - criterion: "Control characters inside the comment cannot break the Slack message."
    tests:
      - ".github/scripts/daily-summary.test.mjs"
  - criterion: "The prompt payload carries titles and counts only, capped at ten entries per list."
    tests:
      - ".github/scripts/daily-summary.test.mjs"
rollout: "Add a repository secret `ANTHROPIC_API_KEY` to enable the comment. The secret is optional: without it the summary posts unchanged. After merge, run the workflow manually with `dry_run` enabled and read the comment in the job log, then run it again with `dry_run` disabled. No migration and no application configuration change is required."
rollback: "Delete the `ANTHROPIC_API_KEY` secret to drop the comment and keep the summary. No code change and no deployment is needed. To remove the feature entirely, revert the pull request. Revoking the API key in the Anthropic console stops all spend."
---

# Implementation summary

`requestComment` sends the collected activity to the Claude API and returns one or two
sentences. `buildBlocks` places that text above the sections, in italics.

`summarizeForPrompt` is a pure function that trims the data before the request: pull request
titles, the age of the review queue, failed workflow names, issue counts, and release tags,
each list capped at ten entries. Whole GitHub API payloads would cost tokens and add nothing.

The comment is optional in both directions. Without `ANTHROPIC_API_KEY` the script skips the
call. When the call fails, `requestComment` logs a warning and returns `null`. The summary is
the product and the comment is a garnish, so a failure must never cost the channel its message.

The request uses `claude-opus-5` at `effort: low`, which suits a two-sentence answer.

# Deviations

The work started as a review comment on pull requests, against `anthropics/claude-code-action`.
That misread the request. The comment belongs to the Slack summary, not to a pull request. The
review workflow was closed unmerged as PR #800 and never reached `main`.

The request uses plain `fetch` rather than `@anthropic-ai/sdk`. The script has no dependencies
and the workflow skips `pnpm install`, so an SDK would change how the job runs for one call.

`max_tokens` is 4000 rather than a value matched to two sentences. Adaptive thinking is on by
default on this model and its tokens count against the limit, so a small ceiling would truncate
the answer.

# Verification evidence

`node --test ".github/scripts/*.test.mjs"` passes 17 tests, 6 of them added by this change.

Both degraded paths were exercised against the live API endpoint with a dry run. With no key
the message held 6 blocks and no comment block. With an invalid key the script logged
`Claude 401` and still built the message.

The successful call needs a real key, so it is verified after merge through the manual trigger
described in `rollout`.

# Related Notes

[Daily GitHub Summary Bot](../../operations/OPS-0009%20Daily%20GitHub%20Summary%20Bot.md)
