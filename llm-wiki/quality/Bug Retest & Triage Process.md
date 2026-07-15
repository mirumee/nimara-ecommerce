---
type: "QA Playbook"
title: "Bug Retest & Triage Process"
description: "The canonical reported-defect verification flow: understand, plan, check prerequisites, execute, conclude from evidence, and record the result."
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

This note defines durable verification behavior. Queue selection, assignment, and external status
changes belong to the execution workflow, not to the Nimara knowledge model.

### Verification flow

1. **UNDERSTAND** — read the complete defect report and available discussion. Restate what
   "reproduces" and "fixed" mean. If reproduction steps or expected behavior are missing, ask
   for them rather than inventing them.
2. **PLAN** — record preconditions (environment, channel, account, data), test steps, controls,
   and explicit decision criteria.
3. **CHECK PREREQUISITES** — confirm environment, credentials, data, and required backend access.
   If anything is missing or ambiguous, stop and state exactly what is needed.
4. **EXECUTE** — drive the real application using the cheapest reliable method from
   [Test Method Playbooks](./Test%20Method%20Playbooks.md). Capture decisive evidence.
5. **CONCLUDE FROM EVIDENCE** — classify the outcome as fixed, still reproducing, partial,
   blocked, routed to a developer, or inconclusive. Never infer fixed from a single failed
   reproduction attempt.
6. **RECORD** — preserve environment/build context, method, result, evidence location, and caveats
   in the verification report.

### Artifacts

- A short plan with preconditions and decision criteria.
- Screenshots, measurements, response captures, logs, or raw tool output when decisive.
- A result summary with environment/build context, repetitions, outcome, and caveats.

### Blocked handling

When a precondition cannot be satisfied, record the blocker and request the exact missing URL,
credential, fixture, backend access, or product decision. Batch related access requests when
possible. See [Known Flaky, Blocked & Backend-Only](./Known%20Flaky%2C%20Blocked%20%26%20Backend-Only.md).

## Related Notes

[Quality & Testing (MOC)](./Quality%20%26%20Testing%20%28MOC%29.md)
[Verdict & Evidence Policy](./Verdict%20%26%20Evidence%20Policy.md)
[Test Method Playbooks](./Test%20Method%20Playbooks.md)
