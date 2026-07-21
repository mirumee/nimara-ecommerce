---
type: "QA Policy"
title: "Verdict & Evidence Policy"
description: "Rules for a defensible QA conclusion: preserve context, distinguish observation from inference, use controls, and never equate absence of reproduction with proof of a fix."
tags:
  - "qa"
  - "verdict"
  - "evidence"
  - "policy"
  - "integrity"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
---

## Content

### Core principles

1. **Evidence only.** Every conclusion must identify the observed behavior and the evidence
   that supports it. State the environment, channel or locale, build or revision when known,
   fixture, method, and attempt count.
2. **Never fabricate.** Missing steps, expected behavior, data, access, or revision are
   limitations to record, not values to guess.
3. **Separate fact from inference.** A screenshot can show rendered output; it does not by
   itself prove the request, stored record, or external side effect that produced it.
4. **Do not force an outcome.** Use an inconclusive or blocked result when the required
   observation cannot be made.

### "Could not reproduce" ≠ "Fixed"

For intermittent defects involving timing, caching, or external state, failing to reproduce
is weak evidence. Before concluding that the behavior is fixed:

- reproduce the original preconditions as closely as possible;
- run a control that proves the surrounding feature and fixture are usable;
- repeat enough times to address the reported intermittency and state the exact count;
- test a build or revision that is expected to contain the change when that fact is known;
- report "not reproduced" with its limits when the evidence still cannot prove a fix.

### Outcome vocabulary

- **Reproduces** — the reported behavior was observed under the stated preconditions.
- **Fixed in tested revision** — the original scenario passes in an identified revision and
  appropriate controls show that the scenario was exercised.
- **Partially fixed** — at least one independently reported behavior still reproduces.
- **Not reproduced** — the behavior was not observed after a stated method and attempt count;
  this does not prove a fix.
- **Inconclusive** — evidence is conflicting, ambiguous, or cannot observe the required layer.
- **Blocked** — a named prerequisite is unavailable.
- **Service-level verification required** — the decisive result exists outside the observable
  UI and requires authorized inspection at that boundary.

### Method-specific caveats to record

- **Code inspection:** repository source may differ from the deployed revision and proves
  implementation, not runtime behavior.
- **Timing tests:** record the latency or throttling profile and both control and experimental
  paths.
- **Performance:** record tool and version, hardware or runner, network profile, sample count,
  raw measurements, and variance.
- **Cross-browser:** name the actual browser project used; configuration alone is not evidence
  that all projects executed.
- **Partial behavior:** list each independently evaluated behavior and its outcome.

### Evidence quality

Prefer the smallest artifact that directly observes the disputed boundary: assertion output,
response capture, trace, screenshot, video, database-safe query result, or service event.
Preserve raw output when summarizing measurements. Redact secrets and personal data. An
artifact without the accompanying scenario, environment, and expected result is not a
complete verdict.

## Related Notes

[Quality & Testing (MOC)](Quality%20%26%20Testing%20%28MOC%29.md)
[Bug Retest & Triage Process](Bug%20Retest%20%26%20Triage%20Process.md)
[Known Flaky, Blocked & Backend-Only](Known%20Flaky%2C%20Blocked%20%26%20Backend-Only.md)
