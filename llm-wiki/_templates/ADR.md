---
type: "ADR"
title: "ADR"
description: "One sentence — the decision and its status (e.g. \"Use RAG over fine-tuning for product discovery — Accepted\")."
tags:
  - "adr"
  - "topic"
created: "2026-06-16T00:00:00+00:00"
timestamp: "2026-06-16T00:00:00+00:00"
status: "Proposed"
---

<!--
  MADR-style ADR. A good ADR is self-contained: a reader who has never seen any other
  ADR must understand what was decided, which alternatives were weighed, and WHY the
  others were rejected — all from this one file. Do not lean on sibling ADRs.

  Hard requirements (the wiki linter and reviewers check these):
  - Decision Drivers: the criteria the options are judged on. State them once, reuse them
    verbatim in "Pros and Cons of the Options".
  - Considered Options: at least TWO real options (usually 2–3). A one-option ADR is a
    press release, not a decision.
  - Decision Outcome: name the chosen option and justify it against the drivers.
  - Every REJECTED option carries an explicit reason for rejection, tied to a driver.
  - Implementation Notes: concrete technical shape — no hand-waving. See that section.

  Keep prose tight. Do NOT paraphrase the epic/solution — link it and state only what
  this decision adds. If you catch yourself restating requirements, cut it.
-->

## Context and Problem Statement

**Base system:** State which system this application, feature, or provider is built on
(e.g. Saleor, Algolia, or a greenfield app from scratch). This must be confirmed with the
user before the ADR is written — see the prerequisite in [ADR MOC](tech/ADR/ADR%20MOC.md).

Two to four sentences: what decision is forced, and why now. Link the driving epic,
solution, or task — do not re-describe its requirements here.

## Decision Drivers

<!-- The yardstick. 4–8 bullets. These are reused verbatim below to score each option. -->

- **Driver one** — e.g. cost / no per-store SaaS fee.
- **Driver two** — e.g. time-to-value for the pilot.
- **Driver three** — e.g. scalability of moderation/aggregation.
- **Driver four** — e.g. GDPR / data-residency surface.
- **Driver five** — e.g. product-page performance.
- **Driver six** — e.g. vendor lock-in.
- **Driver seven** — e.g. operational burden (storage, migrations, deploy).
- **Driver eight** — e.g. fit with Nimara's layer boundaries and Result pattern.

## Considered Options

<!-- At least two. One line each: name + the essence of the approach. -->

1. **Option A** — one-line description.
2. **Option B** — one-line description.
3. **Option C** — one-line description.

## Decision Outcome

**Chosen option: "Option X"**, because … — justify against the Decision Drivers above
(which drivers it wins, which it sacrifices). Active voice, full sentences ("We will …").
One decision per note.

If the decision is not yet settled, say so plainly: **Recommended: Option X, pending
<what resolves it>** — and state the concrete condition or evidence that will confirm or
overturn it.

## Pros and Cons of the Options

<!-- One block per option from "Considered Options". Tie each bullet to a driver.
     REJECTED options MUST include a "Rejected because" line naming the deciding driver. -->

### Option A

- Good, because … (driver).
- Bad, because … (driver).
- Neutral: …
- **Rejected because** … (the driver that killed it) — omit only for the chosen option.

### Option B

- Good, because … (driver).
- Bad, because … (driver).
- **Rejected because** … (driver).

### Option C

- …

## Implementation Notes

<!--
  The technical "how", concrete enough that an implementer can start. Include, as they
  apply to the CHOSEN option:
  - Interface / DTO sketch (pseudo-TypeScript is fine): key method signatures and shapes.
  - Storage mapping: where data lives (which Saleor metadata keys / service tables / SaaS
    entities), public vs private, how aggregates are computed.
  - Concrete file paths in the monorepo layers, e.g.
    `packages/domain/…` (types), `packages/infrastructure/<capability>/<provider>/`
    (implementation), the consuming service in `apps/<app>/src/…`.
  - Env schema: exact variable names (e.g. `FEATURE_SERVICE`, `FEATURE_<PROVIDER>_*`) and
    where they are validated (Zod in `src/envs/server.ts`, forwarded via `turbo.json`).
  - Result pattern: fallible operations return `Result<T, E>` from
    `@nimara/domain/objects/Result`.
  - What to build first (thin vertical slice / MVP path).
-->

```ts
// interface sketch here
```

## Consequences

Positive, negative, and neutral outcomes of the **chosen** option — the trade-offs a future
reader needs to understand why the codebase looks the way it does. Deeper per-option
pros/cons already live above; keep this to what shipping the decision changes.

## Related Notes

[ADR MOC](tech/ADR/ADR%20MOC.md)
Replace this line with a real epic, solution, or task link before use.
