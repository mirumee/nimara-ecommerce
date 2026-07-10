---
type: "Strategic Initiative"
title: "5 - Provider-Agnostic Interface"
description: "Later-tier initiative to formalize replaceable integration contracts only where proven adopter demand justifies the abstraction."
tags:
  - "strategy"
  - "initiative"
  - "providers"
  - "architecture"
created: "2026-07-10T00:00:00+02:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "later"
owner: "architecture"
---

# Content

## Outcome

Selected external integrations can be replaced behind stable Nimara domain-facing contracts
without leaking provider schemas into apps or feature components.

## Guardrail

Provider neutrality is introduced at proven seams, not as a speculative framework. Domain
remains pure, infrastructure owns external APIs and serialization, features compose services,
and apps select concrete providers.

## Entry criterion

Start a provider-neutral contract only after at least two credible implementations or a
documented migration requirement demonstrate the common behavior and the meaningful
differences.

# Related Notes

[Initiative Prioritization](product/strategy/initiatives/Initiative%20Prioritization.md)
[Storefront Developer](product/personas/Storefront%20Developer.md)
[Auto-Invoicing & Regional Tax](product/strategy/initiatives/4%20-%20Auto-Invoicing%20%26%20Regional%20Tax.md)
[Technical Architecture (MOC)](tech/Technical%20Architecture%20%28MOC%29.md)
