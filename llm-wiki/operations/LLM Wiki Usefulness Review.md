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
  - "repo:scripts/wiki-usefulness-benchmark.json"
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

## Canonical benchmark

The five stable benchmark questions and their acceptable routing targets live in
`scripts/wiki-usefulness-benchmark.json`, outside the indexed Markdown bundle. Keeping the
queries outside the wiki prevents the measurement plan from matching its own question text and
artificially displacing the concepts under evaluation.

At the start and end of the month, ask a developer or agent to answer every fixture question
using the wiki, then verify the answer against the repository sources declared by the matched
concepts.

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

The post-iteration retrieval benchmark is recorded below after rebuilding QMD. These setup
checks establish the comparison point; they are not the one-month outcome measurement.

| Benchmark ID                    | First acceptable concept rank | QMD query wall time |
| ------------------------------- | ----------------------------: | ------------------: |
| `layer-boundary`                |                             1 |              6.11 s |
| `marketplace-payment-orders`    |                             1 |              5.54 s |
| `ledger-transfer-eligibility`   |                             1 |              5.12 s |
| `marketplace-vendor-identity`   |                             1 |              4.94 s |
| `storefront-cache-invalidation` |                             2 |              4.70 s |

Initial routing result: 5/5 questions returned an acceptable concept in the top four, 4/5
ranked an acceptable concept first, and median QMD wall time was 5.12 seconds. Query wall time
measures retrieval latency only; the one-month review must separately time a source-verified
answer.

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
