# RFC Quality Checklist

Run every check before presenting or filing the RFC. Fix issues that require no decision; report the rest as owned deferred decisions.

## Research and approach gate

- [ ] The RFC is anchored to exactly one PRD; the PRD exists in `llm-wiki/product/prds/`.
- [ ] 2–3 distinct approaches were researched against primary sources and the repo's real structure — or a single viable approach was confirmed with reasons.
- [ ] Every approach is OSS provider-agnostic; no vendor is mandated as the only option.
- [ ] The chosen approach is recorded; rejected approaches are captured as Alternative solutions with reasons.

## Technical grilling gate

- [ ] The interview asked one question per turn, included a recommendation, and waited for the answer.
- [ ] Discoverable facts (layers, services, schema, config) were explored instead of put to the user as decisions.
- [ ] The user confirmed the shared understanding before drafting or editing.
- [ ] The business bet was not re-litigated; acceptance was left to the ADR.
- [ ] Every question has one `D-*` ledger entry with branch, question, recommendation, user answer, and resulting decision.
- [ ] The base system and system of record were confirmed; the decision drivers were named and ranked, with the dominant two or three marked, and the chosen approach scored against them.
- [ ] The `D-*` ledger was filed as an RFC grilling log beside the RFC (`tech/RFC/<PRD Name>/RFC-NNNN <Title> - Grilling Log.md`), decisions only — no hidden reasoning or secrets.

## Design content

- [ ] The RFC stays at solution altitude — architectural principles, boundaries, and gotchas, not line-level implementation; package placement appears at most as a one-line, non-binding suggestion.
- [ ] Nothing is invented: every tool, library, vendor, capability, number, and default named in the RFC is grounded in the repo (verified, not assumed), in research with a cited source, or in an explicit user decision. Anything new is flagged as a dependency for approval, not slipped in as an example.
- [ ] Problem states facts and forces, not the chosen solution.
- [ ] Functional and non-functional requirements trace to the PRD's outcomes and NFRs.
- [ ] Component changes sit in the correct layer and respect the dependency direction.
- [ ] API changes are exposed through infrastructure use-cases and services, not the raw Saleor schema; fallible operations use `Result<T, E>`.
- [ ] Database changes state backward-compatibility and a migration/rollback strategy.
- [ ] Dependencies lists only actual new dependencies, each as a recommendation with alternatives — no "pending approval" phrasing, and nothing Nimara writes itself listed as a dependency.
- [ ] Every figure a reader could act on links its primary source, with a capture date and a re-verify note.
- [ ] Deferred decisions hold only this RFC's own open items (with owner and gate); PRD open questions are not restated here.
- [ ] No coined jargon that needs a gloss, no research-phase labels ("Approach C") for the chosen design, and every cited PRD/grilling id says what the source actually says.

## Cross-cutting

- [ ] Security covers sensitive data, auth changes, and unacceptable failure modes.
- [ ] Monitoring, alerting, expected failures, and remediation are stated.
- [ ] System impacts name the affected services and any external-system impact.
- [ ] Documentation, QA validation (scenarios only — automatability is the QA team's call), and DevOps/infrastructure changes are covered.
- [ ] Genuinely unresolved decisions are deferred with an owner and a `before <stage>` gate — not fabricated.
- [ ] Reversibility / blast radius is judged and the containing seam named.

## Proposal boundary

- [ ] The RFC records a proposal, not a verdict; it does not decide acceptance.
- [ ] The proposed next step hands off to `solution-author` on the same PRD to write the ADR that accepts or rejects this RFC.

## Wiki hygiene

- [ ] The RFC lives in `tech/RFC/<PRD Name>/`, filename `RFC-NNNN <Title>`, next free ID; its grilling log sits beside it as `RFC-NNNN <Title> - Grilling Log.md`. Status is `Draft` unless the user approved a transition.
- [ ] The RFC is registered in `RFC MOC.md` and linked to its PRD in both directions.
- [ ] `index.md`, `log.md`, and Related Notes are current; renamed inbound links are updated.
- [ ] Sources were preserved and stale downstream artifacts were reported rather than silently rewritten.
