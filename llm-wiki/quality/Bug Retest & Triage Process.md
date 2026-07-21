---
type: "QA Playbook"
title: "Bug Retest & Triage Process"
description: "A tracker-neutral process for understanding, reproducing, and verifying reported defects with explicit prerequisites, decision criteria, and durable evidence."
tags:
  - "qa"
  - "process"
  - "retest"
  - "triage"
  - "runbook"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
---

## Content

Use this process for one reported defect at a time. The purpose is to produce a defensible
observation, not to force every report into a pass/fail result.

### Retest flow

1. **Understand the report.** Restate the affected behavior, original preconditions, actions,
   expected result, and observed result. If any of these are missing, record the gap rather
   than inferring it.
2. **Define the decision criteria.** Say what observation would prove that the defect still
   reproduces, what would support a fix, and what would remain inconclusive. Split reports
   containing multiple behaviors so each can be evaluated independently.
3. **Check prerequisites.** Confirm the exact application URL, deployed revision when known,
   channel or locale, account permissions, test data, and integration availability. Stop and
   request the missing prerequisite when it materially changes the result.
4. **Choose the method.** Prefer the lowest-cost method that can observe the disputed
   behavior directly. See [Test Method Playbooks](Test%20Method%20Playbooks.md).
5. **Execute with a control.** Follow the reported path exactly, then run a nearby known-good
   or deliberately different path when it helps distinguish the defect from an invalid
   environment or fixture.
6. **Capture evidence.** Record the inputs, timestamp, environment, revision when known,
   expected and actual behavior, and the smallest decisive artifact. Do not record secrets.
7. **Conclude conservatively.** Apply [Verdict & Evidence Policy](Verdict%20%26%20Evidence%20Policy.md).
   A missing prerequisite, inaccessible service boundary, or ambiguous observation is an
   inconclusive result, not a fix.

### Minimum retest note

A durable retest note should contain:

- the behavior and scope tested;
- environment, channel or locale, and revision when available;
- prerequisites and fixture identifiers that are safe to disclose;
- exact steps and number of attempts;
- expected and actual results;
- links or paths to evidence that will survive the test session;
- the outcome and any caveat or untested part.

The repository's browser suite is configured to retain a trace on first retry and retain
video and screenshots for failures (`apps/automated-tests/playwright.config.ts`). Those
artifacts can support a result, but the report must still explain what they demonstrate.

### Blocked handling

State the missing input precisely: for example an environment URL, suitable account, seeded
product, service access, or expected behavior. Preserve the observations already made and do
not substitute a different scenario without labeling it as a control. See
[Known Flaky, Blocked & Backend-Only](Known%20Flaky%2C%20Blocked%20%26%20Backend-Only.md).

## Related Notes

[Quality & Testing (MOC)](Quality%20%26%20Testing%20%28MOC%29.md)
[Verdict & Evidence Policy](Verdict%20%26%20Evidence%20Policy.md)
[Test Method Playbooks](Test%20Method%20Playbooks.md)
