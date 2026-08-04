---
type: "Template"
title: "PRD Template"
description: "Reusable template for drafting Product Requirements Documents."
tags:
  - "template"
  - "prd"
created: "2026-07-09T00:00:00+00:00"
timestamp: "2026-07-20T00:00:00+00:00"
# The created record's `type`. It lives in `prd/`, named `PRD-NNN <Title>.md`, with `id`
# matching the filename.
template_for: "Product Requirements Document"
id: "PRD-000"
# `draft`, `analyzing`, `approved`, `implemented`, or `blocked`. New records start as `draft`
# and every transition requires explicit user approval. Register the PRD in `index.md`.
status: "draft"
owner: "github-user-or-team"
prd_type: "business"
# Relative Markdown links to the personas this PRD serves; every link must resolve from
# `prd/`. Repeat them under `Related Notes`. A downstream RFC links to this PRD — do not
# write that relation back by hand.
personas: []
---

# PRD Name

## Value Hypothesis

**For** \<persona\> **who** \<need/pain\>, **the** \<product or capability name\> **is a** \<what it is\> **that** \<key benefit\>, **unlike** \<current alternative\>, **our solution** \<differentiator\>.

## Business Goal & Value

Why this PRD exists and what business value it returns. Prose, 1–2 paragraphs.

## Success Metrics

- M-1: metric — target — how/where measured

## MVP & Falsification

The smallest slice that tests the hypothesis, and the evidence that would make us stop (kill criteria).

## Scope

- S-1: …

## Out of Scope

- deferred item — why, and where it goes (fast-follow / separate PRD)

## User Stories

- US-1 (\<persona\>): As a …, I want …, so that …

## Acceptance Criteria

- AC-1 (US-1): Given … when … then …

## Risks

- R-1: risk — mitigation

## Open Questions

- Q-1: question — owner — must be answered before \<stage\>

## Related Notes

[Initiative Prioritization](../market/strategy/initiatives/Initiative%20Prioritization.md)
