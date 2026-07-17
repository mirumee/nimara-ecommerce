# Deep Research Brief

Use this before proposing approaches. The goal is a small set of well-grounded, mutually distinct approaches the user can choose between — not a literature dump.

## Contents

- [How to research](#how-to-research)
- [What to produce](#what-to-produce)
- [Approach comparison shape](#approach-comparison-shape)
- [Provider-agnostic rule](#provider-agnostic-rule)
- [Completion gate](#completion-gate)

## How to research

- Run the research in a **background agent** so the main thread keeps moving.
- Go to **primary sources**: official docs, source code, specs, first-party APIs, RFCs. Follow every claim back to the source that owns it. A secondary blog post is a lead, not evidence.
- Ground the design in **this repository**: read the layers, services, schema, and config the design would touch. An approach that ignores Nimara's actual boundaries is not a candidate.
- Read the PRD for its deferred technical decisions — those are research questions, not new
  decisions.
- Separate what a source proves from what is inferred. Cite each non-obvious claim with its source.

## What to produce

- **2–3 candidate approaches**, deliberately distinct (not three shades of one idea).
- For each: what it is, how it maps onto Nimara's layers (domain / foundation / infrastructure / features / app), the trade-offs, rough cost and complexity, and the main risks.
- A short recommendation with rationale — but the user chooses.
- If only one approach is genuinely viable, say so with the reasoning; do not manufacture filler alternatives.

## Approach comparison shape

Present approaches side by side so the choice is legible:

> **Approach A — <name>.** What it is. Layer mapping. Pros / cons. Cost. Risks.
>
> **Approach B — <name>.** …
>
> **Recommendation:** A, because … The rest become Alternative solutions in the RFC.

## Provider-agnostic rule

Every approach must layer over existing provider abstractions and stay swappable. Do not mandate a specific SaaS, vendor, or hosted service as the only option. If an approach needs a new external dependency, name it as a dependency to be approved, not as a settled choice. This is a hard rule for Nimara as an OSS project.

## Completion gate

Research is done when:

- each approach is grounded in at least one primary source and in the repo's real structure;
- approaches are distinct and provider-agnostic;
- trade-offs, cost, and risks are stated per approach;
- the user has chosen a direction, or the single viable approach has been confirmed with reasons;
- rejected approaches and their reasons are recorded for the RFC's Alternative solutions.
