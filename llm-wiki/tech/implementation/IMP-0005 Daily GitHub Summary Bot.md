---
type: "Implementation Record"
title: "Daily GitHub Summary Bot"
description: "Adds a scheduled GitHub Actions job that posts a pre-daily repository summary to a Slack Incoming Webhook, covering merged pull requests, the review queue, failed CI on main, and issue and release activity."
tags:
  - "implementation"
  - "github-actions"
  - "slack"
  - "developer-experience"
created: "2026-08-28T00:00:00+00:00"
status: "in_progress"
owner: "engineering"
work_item:
  id: "799"
  url: "https://github.com/mirumee/nimara-ecommerce/pull/799"
relations:
  prds: []
  rfcs: []
  adrs: []
  product_records:
    - "[Daily GitHub Summary Bot](../../operations/OPS-0009%20Daily%20GitHub%20Summary%20Bot.md)"
  rolled_back_by: null
pull_requests:
  - "https://github.com/mirumee/nimara-ecommerce/pull/799"
verification:
  - criterion: "On Monday the summary window reaches back over the weekend, so Friday afternoon work is reported."
    tests:
      - ".github/scripts/daily-summary.test.mjs"
  - criterion: "A pull request title that contains mrkdwn control characters cannot break the Slack link that wraps it."
    tests:
      - ".github/scripts/daily-summary.test.mjs"
  - criterion: "An open pull request older than two days carries a stale marker and a fresh one does not."
    tests:
      - ".github/scripts/daily-summary.test.mjs"
  - criterion: "A list longer than ten entries is truncated and reports how many entries it hid, and no section exceeds the Slack text limit."
    tests:
      - ".github/scripts/daily-summary.test.mjs"
  - criterion: "A window with no activity produces one explicit message instead of empty sections, so the channel can tell a quiet day from a broken bot."
    tests:
      - ".github/scripts/daily-summary.test.mjs"
  - criterion: "Dependabot security runs are excluded from the failed-CI section, so a real red build on main stays visible."
    tests:
      - ".github/scripts/daily-summary.test.mjs"
rollout: "Add a repository secret `SLACK_WEBHOOK_URL` that holds a Slack Incoming Webhook for the daily channel before the first scheduled run. Without the secret the job fails and posts nothing. After merge, run the workflow manually with `dry_run` enabled, read the job log, then run it again with `dry_run` disabled and confirm the message on the channel. No migration and no application configuration change is required."
rollback: "Disable the `Daily GitHub Summary` workflow in the Actions tab, or revert the pull request. The job reads GitHub and writes to one Slack channel, so it holds no state that a revert can strand. The only external state is the Slack webhook, which is revoked in the Slack application."
---

# Implementation summary

`.github/scripts/daily-summary.mjs` collects the repository activity since the previous daily
and posts one Block Kit message to a Slack Incoming Webhook. `collect` holds every GitHub
query and `buildBlocks` is a pure function that turns the collected data into Slack blocks.
The split keeps the formatting rules testable without network access.

The script depends on nothing outside Node. It runs on the version in `.nvmrc`, so the
workflow skips `pnpm install` and stays fast.

`.github/workflows/daily-summary.yaml` holds the schedule and a manual trigger with a
`dry_run` input. The job uses the built-in `GITHUB_TOKEN` with read-only permissions for
contents, actions, pull requests, and issues. A repository guard stops forks from posting.

`.github/workflows/main.yaml` gained one step that runs the script tests, so a broken
formatter fails the pull request instead of failing silently at 09:45.

# Deviations

The plan named a single cron entry. GitHub runs cron in UTC and Poland changes the clock twice
a year, so one entry cannot hit 09:45 local time all year. The workflow declares a summer and
a winter entry, and a guard step reads the Warsaw hour and drops the entry that is an hour
off. The guard compares the hour, not the minute, because GitHub can delay a scheduled run by
several minutes.

The first dry run showed that Dependabot security runs report on `main` as the `dynamic`
event. They filled 13 of 17 rows in the failed-CI section. The script now reports only the
`push`, `workflow_run`, `schedule`, and `workflow_dispatch` events, and keeps the newest
failure per workflow and commit.

The plan named no automated tests. A test file on the built-in `node:test` runner covers the
pure parts at no dependency cost, so it was added.

# Verification evidence

A dry run against the live repository with a 336-hour window produced every section with
correct links and authors. A dry run with a 1-hour window produced the quiet message. Before
the event filter the failed-CI section held 17 entries; after it, 4 real `Linters & Tests`
failures.

`node --test ".github/scripts/*.test.mjs"` passes 11 tests.

The scheduled path and the Slack delivery are verified after merge, through the manual trigger
described in `rollout` and in the runbook.

# Related Notes

[Daily GitHub Summary Bot](../../operations/OPS-0009%20Daily%20GitHub%20Summary%20Bot.md)
