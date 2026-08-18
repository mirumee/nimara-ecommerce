---
type: "Template"
title: "Test Case Template"
description: "Reusable format for a single QA test case: one behaviour class, one representative, one evidence-backed verdict."
tags:
  - "template"
  - "qa"
  - "test-case"
created: "2026-08-10T08:28:14+00:00"
# A generic template (no `template_for`): test cases are QA work-products, not durable
# llm-wiki records. Instances are written by the `test-case-design` skill under
# `qa/triage/plans/<NAME>-tests.md` and their evidence under `qa/triage/evidence/<NAME>/`.
# This file is the format contract those instances follow. Keep the format here; keep the
# instances out of the wiki tree.
---

## Content

One test case covers exactly one **behaviour class** — the smallest set of inputs that all
behave the same — with one representative and, where the class has edges, its boundary and
negative neighbours. Derive classes by equivalence partitioning against a source of truth,
never from ad-hoc examples. See [Coverage Maps](../quality/Coverage%20Maps.md).

A set of these is complete only when every class is either covered or explicitly skipped with
a reason — no silent gaps.

### Identity

- **ID:** `TC-<feature>-<NN>` — stable within the plan it belongs to.
- **Title:** the behaviour under test, in one line.
- **Requirement / source of truth:** link the PRD, spec, or data source the class derives
  from (e.g. `google-i18n-address all.json`, a PRD acceptance criterion).
- **Behaviour class:** the partition this case represents, and why one representative covers
  the whole class.

### Preconditions

- **Environment & channel:** exact env URL and channel prefix — see
  [Environments & Access Matrix](../quality/Environments%20%26%20Access%20Matrix.md).
- **Account / auth state:** guest, logged-in, role.
- **Data & fixtures:** the specific verified data used — see
  [Test Data & Fixtures](../quality/Test%20Data%20%26%20Fixtures.md). Never fabricate; if data
  is missing, stop and ask.
- **App / cart state:** any starting state the case assumes.

### Steps

1. …
2. …

### Expected result

What must be observed for a pass — stated as a checkable assertion, not a vague expectation.
Include the expected failure path where the class has one.

### Method

The cheapest reliable technique that directly observes this behaviour (source inspection,
unit, route, browser, geometry, response capture, …) and its limitations. See
[Test Method Playbooks](../quality/Test%20Method%20Playbooks.md).

### Result

- **Verdict:** pass / fail / blocked — on evidence only; "couldn't make it fail" ≠ pass. See
  [Verdict & Evidence Policy](../quality/Verdict%20%26%20Evidence%20Policy.md).
- **Evidence:** path under `qa/triage/evidence/<NAME>/` (screenshot, measurement, response
  capture) plus the exact env/build/SHA observed.
- **Notes / caveats:** flakiness, control run, method limits — see
  [Known Flaky, Blocked & Backend-Only](../quality/Known%20Flaky%2C%20Blocked%20%26%20Backend-Only.md).

### On failure

Generalise the failure to its **class**, then classify and file per
[Defect Taxonomy & Severity](../quality/Defect%20Taxonomy%20%26%20Severity.md).

## Related Notes

[Quality & Testing (MOC)](../quality/Quality%20%26%20Testing%20%28MOC%29.md)
[Coverage Maps](../quality/Coverage%20Maps.md)
[Test Data & Fixtures](../quality/Test%20Data%20%26%20Fixtures.md)
[Test Method Playbooks](../quality/Test%20Method%20Playbooks.md)
[Verdict & Evidence Policy](../quality/Verdict%20%26%20Evidence%20Policy.md)
