---
type: "Operational Record"
title: "Daily GitHub Summary Bot"
description: "Operates the scheduled GitHub Actions job that posts the pre-daily repository summary to Slack, including webhook setup, schedule changes, and failure diagnosis."
tags:
  - "operations"
  - "github-actions"
  - "slack"
  - "runbook"
created: "2026-08-28T00:00:00+00:00"
status: "active"
owner: "release-engineering"
kind: "runbook"
relations:
  implementations:
    - "[Daily GitHub Summary Bot](../tech/implementation/IMP-0005%20Daily%20GitHub%20Summary%20Bot.md)"
    - "[Daily Summary Claude Comment](../tech/implementation/IMP-0006%20Daily%20Summary%20Claude%20Comment.md)"
  product_records: []
---

# Trigger

Use this procedure to install the daily summary bot in a new Slack workspace, to change the
delivery time, to rotate the Slack webhook, or to diagnose a missing message on the daily
channel.

The bot posts one message at 09:45 Europe/Warsaw, Monday to Friday, 15 minutes before the
daily meeting. The message lists pull requests merged since the previous daily, open pull
requests waiting for review, failed `Linters & Tests` runs on `main`, and issue and release
activity.

# Preconditions

- Confirm that you administer the Slack workspace that owns the daily channel.
- Confirm that you hold the `admin` role on `mirumee/nimara-ecommerce`. Repository secrets are
  not visible to other roles.
- The workflow runs only on `mirumee/nimara-ecommerce`. Forks skip the job.

# Procedure

## Install the Slack webhook

1. Open the Slack API dashboard and create an application in the workspace.
2. Enable **Incoming Webhooks**.
3. Add a webhook and select the daily channel.
4. Copy the webhook address.
5. In GitHub, open Settings, then Secrets and variables, then Actions.
6. Add a repository secret named `SLACK_WEBHOOK_URL` and paste the address.

The webhook address is a secret. Anyone who holds it can post to the channel. Do not commit it
to the repository and do not paste it into an issue or a pull request.

## Change the delivery time

1. Open `.github/workflows/daily-summary.yaml`.
2. GitHub runs cron in UTC. Poland changes the clock twice a year, so the workflow declares two
   schedule entries: one for summer time and one for winter time.
3. Set both entries to the target time. Subtract two hours from local time for the summer entry
   and one hour for the winter entry.
4. Update the hour in the `Check the local hour` step to match the new local hour.

The guard step compares the hour, not the minute. GitHub can delay a scheduled run by several
minutes and a minute-exact guard would drop valid runs.

## Install the Claude API key

The comment above the sections is optional. Without the key the bot posts the sections alone.

1. Open the Anthropic console and create an API key.
2. In GitHub, open Settings, then Secrets and variables, then Actions.
3. Add a repository secret named `ANTHROPIC_API_KEY` and paste the key.

The bot sends one request per weekday. It uses the model `claude-opus-5` at effort `low`, and
it trims the data to titles and counts before the request, so one run costs a fraction of a
cent. To drop the comment and keep the sections, delete the secret. No code change is needed.

## Change the summary content

1. Open `.github/scripts/daily-summary.mjs`.
2. `collect` holds every GitHub query. `buildBlocks` holds every Slack section.
   `COMMENT_SYSTEM_PROMPT` holds the instructions for the Claude comment, and
   `summarizeForPrompt` holds what Claude receives.
3. The script has no dependencies. It runs on the Node version in `.nvmrc`.
4. Verify the change with the dry run below before you merge it.

## Rotate the webhook

1. Delete the old webhook in the Slack application.
2. Add a new webhook for the same channel.
3. Replace the value of the `SLACK_WEBHOOK_URL` secret in GitHub.
4. Run the workflow manually with `dry_run` set to `false` and confirm the message arrives.

# Verification

Run the script locally against the live repository. The dry run prints the message and posts
nothing:

```bash
GITHUB_TOKEN=$(gh auth token) \
GITHUB_REPOSITORY=mirumee/nimara-ecommerce \
LOOKBACK_HOURS=336 \
DRY_RUN=1 \
node .github/scripts/daily-summary.mjs
```

Repeat the command with `LOOKBACK_HOURS=1`. The script must print one line about a quiet
repository instead of empty sections.

To verify the deployed workflow, open the Actions tab, select **Daily GitHub Summary**, and run
it manually. Keep `dry_run` enabled for the first run and read the job log. Then run it again
with `dry_run` disabled and confirm the message on the channel.

# Escalation

If the message does not arrive, check the following in order:

1. Open the Actions tab and confirm that the workflow started. GitHub delays or drops scheduled
   runs when the platform is under load, and it disables schedules on repositories with no
   activity for 60 days.
2. Read the `Check the local hour` step. A skipped job means that the guard rejected the
   off-season schedule entry, which is the expected behavior for one of the two entries.
3. Read the `Post summary` step. A `Missing required environment variable SLACK_WEBHOOK_URL`
   message means that the secret is absent or empty.
4. A `Slack 403` or `Slack 404` message means that the webhook was revoked. Rotate it with the
   procedure above.
5. When the GitHub API fails, the script posts a short warning to the channel and exits with
   code 1. The job log holds the status code and the failing path.

If the message arrives without the comment above the sections, the sections are correct and
only the Claude call failed. Read the `Post summary` step for a `Claude` warning line:

- No warning line means that `ANTHROPIC_API_KEY` is absent. The bot skipped the call.
- `Claude 401` means that the key is wrong or revoked.
- `Claude 429` means that the account hit its Anthropic rate limit.

A failed comment never blocks the summary, so the job still succeeds. This is intended. The
sections are the product and the comment is a garnish.

The bot is not on the release path. If it stays broken, disable the workflow in the Actions tab
and raise an issue. Do not block a release on it.

# Related Notes

[Daily GitHub Summary Bot](../tech/implementation/IMP-0005%20Daily%20GitHub%20Summary%20Bot.md)
[Trunk Release and Production Rollback](OPS-0008%20Trunk%20Release%20and%20Production%20Rollback.md)
[Operations (MOC)](Operations%20%28MOC%29.md)
