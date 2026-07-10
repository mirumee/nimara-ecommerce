---
type: "Measurement Plan"
title: "LLM Wiki Usefulness Review"
description: "One-month evaluation gate for deciding whether Nimara should automate more of the LLM-wiki ingestion workflow."
tags:
  - "llm-wiki"
  - "operations"
  - "measurement"
  - "review"
created: "2026-07-10T00:00:00+02:00"
timestamp: "2026-07-10T00:00:00+02:00"
status: "measurement-active"
owner: "wiki-maintainers"
review_on: "2026-08-10"
source_refs:
  - "wiki:AGENTS.md"
  - "repo:scripts/wiki-lint.mjs"
---

# Content

## Decision to make

On 2026-08-10, decide whether to keep the operational wiki at its current human-reviewed
workflow, simplify it, or invest in automated ingestion from pull requests and external work
systems. No additional ingestion automation should be adopted before this review.

## Baseline before the operational iteration

Recorded on 2026-07-10:

| Measure                           | Baseline |
| --------------------------------- | -------: |
| Concept documents                 |       40 |
| QMD indexed documents             |       40 |
| Deterministic lint findings       |       23 |
| Technical runtime-flow pages      |        0 |
| Registered ADRs                   |        0 |
| Complete initiative-to-QA tracers |        0 |

## Canonical questions

At the start and end of the month, ask a developer or agent to answer these questions using
the wiki and verify the answer against repository sources:

1. Where is the boundary between Nimara features and external-provider infrastructure?
2. How does a marketplace customer payment become one or more Saleor orders?
3. When is a vendor ledger line eligible for a Stripe Transfer?
4. How is vendor identity established for marketplace GraphQL operations?
5. Which storefront data is cached and how does Saleor invalidate it?

## Initial iteration checkpoint

Recorded after the first operational-wiki iteration on 2026-07-10:

| Measure                                                       | Checkpoint |
| ------------------------------------------------------------- | ---------: |
| Concept documents                                             |         54 |
| QMD indexed Markdown files, including `index.md` and `log.md` |         56 |
| Deterministic lint findings                                   |          0 |
| Technical runtime-flow pages                                  |          5 |
| Registered ADRs                                               |          1 |
| Complete initiative-to-QA tracers                             |          1 |

QMD routed the ledger-eligibility question to
[Marketplace Ledger and Payout Flow](tech/flows/Marketplace%20Ledger%20and%20Payout%20Flow.md)
as its first result. The vendor-identity question returned
[Marketplace Authentication Flow](tech/flows/Marketplace%20Authentication%20Flow.md) within
the top two results. These are setup checks, not the one-month outcome measurement.

## Metrics to collect

| Metric                                  | Collection method                                                           | Target after one month |
| --------------------------------------- | --------------------------------------------------------------------------- | ---------------------: |
| Median time to a source-verified answer | Time the five canonical questions                                           |           <= 5 minutes |
| Correct source routing                  | Relevant repository source appears in QMD top 10 and final answer           |                 >= 80% |
| Wiki integrity                          | `pnpm wiki:lint`                                                            |             0 findings |
| PR discipline                           | Sample merged PRs with `Wiki impact` answered                               |                 >= 90% |
| Update usefulness                       | Wiki-changing PRs that modify an existing concept instead of duplicating it |                 >= 80% |
| Maintenance cost                        | Median human review time for a wiki update                                  |          <= 10 minutes |

## Decision rules

- **Automate more** only if answer time and routing targets are met, lint remains clean, and
  human review is the main remaining cost.
- **Keep the current workflow** if the wiki is useful but volume is too low to justify event-
  driven ingestion.
- **Simplify** if contributors frequently skip the impact field, concepts duplicate code, or
  maintenance exceeds the time saved during discovery.

## Review record

On or after `review_on`, replace this paragraph with measured results, evidence links, and one
of the three decisions above. Update `timestamp`, append the operation to `log.md`, and record
an ADR only if the chosen automation materially changes the knowledge-system architecture.

# Related Notes

[Operations (MOC)](operations/Operations%20%28MOC%29.md)
[Technical Architecture (MOC)](tech/Technical%20Architecture%20%28MOC%29.md)
[LLM Wiki](sources/LLM%20Wiki.md)
[Agent Instructions](AGENTS.md)
