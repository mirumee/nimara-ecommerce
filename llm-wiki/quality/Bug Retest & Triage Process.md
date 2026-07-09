---
type: "QA Playbook"
title: "Bug Retest & Triage Process"
description: "The canonical per-ticket retest flow for a live, shared board — understand → plan → prereq/ASK → claim → execute → conclude (evidence-only) → log — plus the live-queue selection loop."
tags:
  - "qa"
  - "process"
  - "retest"
  - "triage"
  - "runbook"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-06-30T00:00:00+00:00"
---

## Content

The authoritative copy of this process is in repo `CLAUDE.md` (Phase 2.0 + Phase 2). This note summarises it for the wiki; the executable version is the skill `skills/qa/bug-retest-triage`.

### Phase 2.0 — pick the next task (LIVE board, shared with human QA)
The board changes in real time. **Re-query before every ticket; never trust a cached list.**
1. Refresh: query the target column's status (e.g. `status = "To refine" AND assignee IS EMPTY ORDER BY created ASC`). Intersect with `qa/triage/worklist.json`; skip `retestable:false` or already `blocked_needs_human`.
2. If empty → stop, report "queue clear".
3. Pick the top candidate; **re-fetch it** to confirm still unassigned + same status (a human may have grabbed it). If changed, skip and re-query.
4. Run the per-ticket flow. **Do not claim here** — the claim happens inside, after the prereq check, so un-doable tickets stay available for humans.
5. Return to step 1.

### Per-ticket flow
1. **UNDERSTAND** — `jira_get_issue` (full + comments). Restate the defect and what "reproduces vs fixed" concretely looks like. If repro/expected is missing, do NOT invent it — that's an ASK trigger.
2. **PLAN** — write `qa/triage/plans/<KEY>.md`: preconditions (env URL, channel, account, test data), the steps, explicit decision criteria.
3. **PREREQ CHECK — ASK IF BLOCKED.** Confirm you have env/credentials/data. If anything is missing or the repro is ambiguous → STOP and ASK, listing exactly what you need. Never fabricate.
4. **CLAIM** — re-fetch to confirm still unassigned + status, then transition to `In testing` (id 25). Claim happens only after prereqs pass.
5. **EXECUTE** — drive the real app (see [Test Method Playbooks](quality/Test%20Method%20Playbooks.md)). Capture decisive evidence → `qa/triage/evidence/<KEY>/`.
6. **CONCLUDE — on evidence only** — Done (fixed) / Open (reproduces) / leave In testing + ASK (inconclusive). Add a short factual comment (no AI/automation wording).
7. **LOG** — append `qa/triage/jira-actions.json`; set state in `qa/triage/worklist.json`. Report, then next ticket.

### Artifacts (the audit trail)
- `qa/triage/plans/<KEY>.md` — plan per ticket.
- `qa/triage/evidence/<KEY>/` — screenshots, `results.md`, raw tool output (e.g. Lighthouse JSON).
- `qa/triage/worklist.json` — per-ticket `current_status`, `retestable`, `retest_status`, `evidence_path`, `notes`.
- `qa/triage/jira-actions.json` — append-only log of transitions/comments/timestamps.

### Blocked handling
On a precondition you can't satisfy: leave the ticket where it is, mark `blocked_needs_human` in `worklist.json`, comment what's needed (mentioning the QA owner), ASK, and move on. Batch access asks. See [Known Flaky, Blocked & Backend-Only](quality/Known%20Flaky%2C%20Blocked%20%26%20Backend-Only.md).

## Related Notes
[Quality & Testing (MOC)](quality/Quality%20%26%20Testing%20%28MOC%29.md)
[Jira & Board 74 Operating Manual](quality/Jira%20%26%20Board%2074%20Operating%20Manual.md)
[Verdict & Evidence Policy](quality/Verdict%20%26%20Evidence%20Policy.md)
[Test Method Playbooks](quality/Test%20Method%20Playbooks.md)
