---
type: "Template"
title: "Test Plan Template"
description: "Reusable format for a test plan: the surface, the axes to cover, the approach per axis, and what would block or stop the effort."
tags:
  - "template"
  - "qa"
  - "test-plan"
created: "2026-08-10T08:28:14+00:00"
# A generic template (no `template_for`): a test plan is a QA work-product, not a durable
# llm-wiki record. Instances are written under `qa/test-plan/<NAME>.md` (or
# `qa/triage/plans/`) and drive `test-case-design` / `regression-sweep`. This file is the
# format contract; keep the instances out of the wiki tree.
---

## Content

A test plan states **what will be covered and how** before any browser opens, so coverage is
a decision rather than an accident. It sits above test cases: the plan enumerates the axes
and the approach; the cases cover the classes within them. Keep it short — a plan nobody reads
before executing is waste.

### Scope

- **Feature / surface under test:** what this plan covers, in one line.
- **Requirement / source of truth:** link the PRD, spec, or coverage map this plan derives
  from — see [Coverage Maps](../quality/Coverage%20Maps.md).
- **In scope / out of scope:** name what is deliberately excluded and why (fast-follow,
  backend-only, separate plan).

### Coverage axes

The variables that change behaviour, and the representatives swept per axis — e.g.
page type × channel (`/` US, `/gb` GB) × device × auth state × payment outcome. Partition,
don't enumerate: cover each class, not every input.

| Axis | Values / representatives | Why it matters |
| --- | --- | --- |
| … | … | … |

### Approach per axis

The cheapest reliable method for each signal — curl+grep for SEO/structural, Lighthouse for
perf, Playwright for interactive flows, response listeners for contracts. See
[Test Method Playbooks](../quality/Test%20Method%20Playbooks.md). Note which axes become
individual test cases ([Test Case](TestCase.md)) and which are a broad sweep.

### Environments & data

- **Environments / channels:** exact URLs and channel prefixes — see
  [Environments & Access Matrix](../quality/Environments%20%26%20Access%20Matrix.md).
- **Accounts & fixtures:** the verified data and accounts needed — see
  [Test Data & Fixtures](../quality/Test%20Data%20%26%20Fixtures.md). List what is missing;
  never fabricate.

### Entry & exit criteria

- **Entry:** what must be true to start (feature deployed to the target env, PRD reviewed,
  data available).
- **Exit / done:** every axis covered or explicitly skipped with a reason; verdicts backed by
  evidence per [Verdict & Evidence Policy](../quality/Verdict%20%26%20Evidence%20Policy.md).
- **Kill / block criteria:** what makes the effort stop and ask — missing env, missing data,
  a blocking defect — see [Known Flaky, Blocked & Backend-Only](../quality/Known%20Flaky%2C%20Blocked%20%26%20Backend-Only.md).

### Risks & known gaps

- R-1: risk — how it is handled or accepted.

## Related Notes

[Quality & Testing (MOC)](../quality/Quality%20%26%20Testing%20%28MOC%29.md)
[Coverage Maps](../quality/Coverage%20Maps.md)
[Test Method Playbooks](../quality/Test%20Method%20Playbooks.md)
[Environments & Access Matrix](../quality/Environments%20%26%20Access%20Matrix.md)
[Verdict & Evidence Policy](../quality/Verdict%20%26%20Evidence%20Policy.md)
