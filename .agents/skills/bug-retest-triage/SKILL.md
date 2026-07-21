---
name: bug-retest-triage
description: Retest a reported defect on the live Nimara board (Jira project MS, board 74) and give it an evidence-backed verdict — still reproduces → Open, fixed → Done, blocked → leave In testing and ask. Use this skill whenever the user asks to retest, re-verify, triage, or work through reported bugs/tickets one at a time; to "run the Phase 2 flow"; to pick the next ticket off the To Do column; or to confirm whether a fix holds. Works one ticket at a time on a board shared with human QA. Do NOT use for designing new test cases from a spec (use test-case-design) or for a broad regression pass (use regression-sweep).
---

# Bug Retest & Triage

Retest reported defects on the **live** board and reach a defensible verdict, one ticket at a time, without ever fabricating data or forcing a result. This mirrors the project's CLAUDE.md "Phase 2" flow and the wiki note [[Bug Retest & Triage Process]].

## Operating principles

1. **Evidence only.** A verdict requires an artifact (screenshot, measurement, response capture) under `qa/triage/evidence/<KEY>/`. "Couldn't make it fail" is not "fixed" — see [[Verdict & Evidence Policy]].
2. **Never fabricate.** Missing repro steps, data, or credentials = STOP and ASK, never guess.
3. **One ticket at a time**, on a shared board. Claim a ticket (move to "In testing") **only after** the prereq check passes — re-fetch first to confirm it's still To Do + unassigned; if taken, abandon and pick another.
4. **Don't force a verdict.** Ambiguous/blocked → leave In testing, ASK, flag for review.

## Before you start

Read [[Environments & Access Matrix]] and [[Jira & Board 74 Operating Manual]] (column↔status map, transition IDs, required `customfield_10044`, comment rules). Set `READ_ONLY_MODE=false` for board writes.

## Workflow (per ticket)

1. **UNDERSTAND** — `jira_get_issue` (full: description, repro, expected vs actual, environment, comments, attachments). State in your own words what the defect is and what "still reproduces" vs "fixed" concretely looks like. Gaps in repro/expected = ASK trigger.
2. **PLAN** — write `qa/triage/plans/<KEY>.md`: preconditions (env URL, account, data, cart state), steps, and explicit decision criteria (which observation → Open, which → Done).
3. **CHECK PREREQS — ASK IF BLOCKED.** Confirm env URL, credentials, specific data before opening the browser. If anything is missing/inaccessible/ambiguous: STOP and ASK, listing exactly what you need. Batch asks across tickets.
4. **CLAIM** — re-fetch; if still To Do + unassigned, `jira_get_transitions` → transition to "In testing" (ID 25).
5. **EXECUTE** — drive the app via Playwright per the plan; pick the cheapest reliable method ([[Test Method Playbooks]]); run a **control** for ambiguous/flaky results. Screenshot the decisive step(s) → `qa/triage/evidence/<KEY>/`.
6. **CONCLUDE — on evidence only.** No longer occurs → "Done" (31). Still occurs → "Open" (23). Backend-only → route to dev (label `dev_verify`, → Open). Inconclusive/blocked → leave In testing, ASK. Add a factual comment via `jira_add_comment` (no AI/automation references): "Retested on <env/channel>: no longer reproduces — <one line>." / "...still reproduces — <one line>."
7. **LOG** — append `qa/triage/jira-actions.json` and set `retest_status` in `qa/triage/worklist.json`. Report, then next ticket.

## References

[[Bug Retest & Triage Process]] · [[Jira & Board 74 Operating Manual]] · [[Known Flaky, Blocked & Backend-Only]] · [[Test Method Playbooks]] · [[Verdict & Evidence Policy]]
