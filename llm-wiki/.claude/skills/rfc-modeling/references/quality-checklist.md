# RFC Quality Checklist

Run every check before you present or file the RFC. Fix the issues that need no decision. Report the rest as deferred decisions with an owner.

## Research and approach gate

- [ ] The RFC is anchored to exactly one PRD, and that PRD exists in `llm-wiki/prd/`.
- [ ] 2 to 3 distinct approaches were researched against primary sources and against the real structure of the repository, or a single viable approach was confirmed with reasons.
- [ ] The chosen approach is recorded. The rejected approaches are captured as Alternative solutions with their reasons.

## Technical grilling gate

- [ ] The interview asked one question per turn, included a recommendation, and waited for the answer.
- [ ] Discoverable facts (layers, services, schema, config) were explored, not put to the user as decisions.
- [ ] The user confirmed the shared understanding before any drafting or editing.
- [ ] The business bet was not re-opened, and acceptance was left to the ADR.
- [ ] Every structural decision was put to the user as a visual through the `/llm-wiki:show-me` skill, at solution altitude, and no turn carried more than one visual.
- [ ] The base system and the system of record are confirmed. The decision drivers are named and ranked, the dominant two or three are marked, and the chosen approach is scored against them.

## Design content

- [ ] The RFC stays at solution altitude: architectural principles, boundaries, and gotchas, not line-level implementation. Package placement appears at most as a one-line suggestion that does not bind the implementer.
- [ ] Nothing is invented. Every tool, library, vendor, capability, number, and default in the RFC is grounded in the repository as a verified fact, in research with a cited source, or in an explicit user decision. Anything new is flagged as a dependency for approval, not slipped in as an example.
- [ ] Problem states facts and forces, not the chosen solution.
- [ ] The functional and non-functional requirements trace to the PRD outcomes and NFRs.
- [ ] API changes are exposed through the boundaries that the repository owns, and no raw schema became the contract.
- [ ] Database changes state backward compatibility and a migration and rollback strategy.
- [ ] Dependencies lists only actual new dependencies, each as a recommendation with alternatives. No "pending approval" phrasing appears.
- [ ] Every figure a reader can act on links its primary source, with a capture date and a note to re-verify it.
- [ ] Every fact appears once. A requirement stated under Requirements is not restated under Component changes or API changes.
- [ ] The technical terms of the repository survived. The RFC uses the service names, the error contract, and the boundary names that the code carries. No term became a folksy paraphrase.
- [ ] No coined term needs a gloss. No research-phase label such as "Approach C" names the chosen design.
- [ ] Every cited PRD section or requirement ID says what the source actually says.
- [ ] Deferred decisions hold only the open items of this RFC, each with an owner and a gate. PRD open questions are not restated here.

## Cross-cutting

- [ ] Security covers sensitive data, auth changes, and the failure modes that are unacceptable.
- [ ] Monitoring, alerting, expected failures, and remediation are stated.
- [ ] System impacts name the affected services and every impact on an external system.
- [ ] Documentation, QA validation, and DevOps and infrastructure changes are covered. QA validation lists scenarios only, because automatability is the call of the QA team.
- [ ] A section that does not apply says so in one sentence, or says "None". No section is padded to look substantial.
- [ ] Genuinely unresolved decisions are deferred with an owner and a `before <stage>` gate. None is fabricated.

## Proposal boundary

- [ ] The RFC records a proposal, not a verdict. It does not decide acceptance.
- [ ] The proposed next step is an ADR that accepts or rejects this RFC and links back to it.
