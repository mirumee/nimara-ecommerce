---
type: "Persona"
title: "QA Engineer (Test Agent)"
description: "A human or autonomous QA persona that verifies behaviour from evidence, handles uncertain results explicitly, and never fabricates or forces a conclusion."
tags:
  - "persona"
  - "qa"
  - "agent"
  - "testing"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-06-30T00:00:00+00:00"
knowledge_status: "reference"
source_status: "research_derived"
---

## Content

### Goals

- Give every reported defect a **defensible, evidence-backed verdict** without rediscovering the environment or test method each time.
- Keep the verification trail complete through reproducible steps, observations, artifacts, and environment context.
- Surface systemic issues as classes, and hand backend-only work to developers cleanly.

### Pain points (what slows this persona)

- **Access friction**: Saleor, ERP, SSO-gated documentation, and missing test credentials can block verification; round-trips for access dominate the cost.
- **Missing context**: environment, channel, build, fixture, and expected backend state must be explicit before verification starts.
- **Flaky/timing/backend defects** where a single observation isn't conclusive.
- **Serial work**: many independent checks can run in parallel, but shared environments and mutable fixtures require coordination.

### Behaviour patterns

- Reads the [Environments & Access Matrix](../../quality/Environments%20%26%20Access%20Matrix.md) and [Verdict & Evidence Policy](../../quality/Verdict%20%26%20Evidence%20Policy.md) before acting.
- Begins verification only after prerequisites pass; batches requests for missing input instead of guessing.
- Picks the **cheapest reliable method per bug class** ([Test Method Playbooks](../../quality/Test%20Method%20Playbooks.md)); runs a **control** for ambiguous results.
- Records factual results with the method, environment, observations, and evidence.

### Key quote

> "I don't call it fixed because I couldn't make it fail — I call it fixed when the evidence shows the fix holds."

### Product implications

- Invest in deterministic QA context: environment URLs, channel identifiers, build versions, fixtures, and expected states.
- Make backend signals observable to QA through safe read-only Saleor/GraphQL access and working ERP/stage environments.
- Treat this wiki and maintained test runbooks as the durable source of QA knowledge; keep individual execution artifacts transient.

## Related Notes

[Storefront Developer](./Storefront%20Developer.md)
[Ecommerce Manager](./Ecommerce%20Manager.md)
[Quality & Testing (MOC)](../../quality/Quality%20%26%20Testing%20%28MOC%29.md)
