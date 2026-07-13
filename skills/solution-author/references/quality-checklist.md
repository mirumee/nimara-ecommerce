# ADR Quality Checklist

Run every check before presenting or filing the ADR. Fix issues that require no new
decision; report the rest as owned open sub-decisions. `example-adr.md` is the bar.

**Run the mechanical linter first:** `pnpm wiki:adr:lint "<path to the ADR>"` (or
`node scripts/wiki-adr-lint.mjs "<path>"`). It fails the structural checks below
automatically — fix every ERROR before hand-reviewing the rest of this list. The manual
checks catch what a regex cannot (are the drivers real, is the rejection reason honest).

## Technical grilling gate

- [ ] The interview asked one question per turn, included a recommendation, and waited for the answer.
- [ ] The base system was confirmed as the first decision and is recorded verbatim.
- [ ] Discoverable facts (epic, code, reference notes, existing ADRs) were explored instead of put to the user as decisions.
- [ ] The user confirmed the shared understanding before drafting.
- [ ] Every question has one `D-*` ledger entry with branch, question, recommendation, user answer, and resulting decision.

## Decision integrity

- [ ] **Context** names the **Base system** and states the problem in a few sentences; the epic is linked, not paraphrased.
- [ ] **Decision Drivers** are explicit and are the same criteria used to score the options.
- [ ] **Considered Options** lists at least two real options (no strawmen).
- [ ] **Decision Outcome** names the chosen option and justifies it against the drivers; if not final, it says "Recommended, pending <condition>".
- [ ] **Every rejected option** has a "Rejected because" reason naming the deciding driver.
- [ ] The ADR is **self-contained**: it does not rely on sibling ADRs to explain its alternatives.

## Implementation concreteness

- [ ] **Implementation Notes** include an interface/DTO sketch (pseudo-TS acceptable).
- [ ] A **storage mapping** is stated (tables / metadata keys / SaaS entities; public vs private; how aggregates are computed).
- [ ] **Real monorepo paths** are named (`packages/domain/…`, `packages/infrastructure/<capability>/<provider>/`, the consuming service).
- [ ] An **env schema** is given (selector variable + per-provider namespaced config + where validated).
- [ ] The `Result<T, E>` convention and layer boundaries are respected; app/component code does not import `@nimara/codegen`.
- [ ] "What to build first" (a thin vertical slice) is stated.
- [ ] Line-level details correctly deferred to implementation are recorded as deferred, not silently dropped.

## Cross-cutting and reversibility

- [ ] Performance on hot paths and graceful degradation on provider failure are addressed.
- [ ] Security/authorization at the boundary is addressed.
- [ ] Data lifecycle (retention, deletion/anonymization, residency) is addressed where PII is involved.
- [ ] Observability (logging, audit trail, events/webhooks) is addressed where relevant.
- [ ] Reversibility/blast radius is judged, and the seam that contains it (or what would supersede the ADR) is named.

## Wiki hygiene

- [ ] Filename is `ADR-NNNN <Title>.md`, next free number in the wiki register; any clash with the code-docs register is noted, not silently reused.
- [ ] Status is in frontmatter (`Proposed` unless the user approved `Accepted`); Accepted ADRs are treated as immutable (supersede, never rewrite).
- [ ] The ADR is registered in the ADR MOC and linked to its epic in both directions.
- [ ] `index.md` and `log.md` are updated in the same change.
- [ ] The solution grilling log was created or appended from the wiki template, continues stable `D-*` IDs, and links to the ADR and epic.
- [ ] The grilling log contains user-visible decisions only; confidential sources, secrets, personal data, and hidden reasoning were not copied.
- [ ] Sources were preserved and stale downstream artifacts were reported rather than silently rewritten.
