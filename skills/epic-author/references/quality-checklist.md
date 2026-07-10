# Epic Quality Checklist

Run every check before presenting or filing the epic. Fix issues that require no decision; report the rest as owned Open Questions.

## Business grilling gate

- [ ] The interview asked one question per turn, included a recommendation, and waited for the answer.
- [ ] Discoverable facts were explored instead of put to the user as decisions.
- [ ] The user confirmed the shared understanding before drafting or editing.
- [ ] Technical design choices were deferred unless they materially changed the business bet.

## Identity and audience

- [ ] `id` is a unique `EPIC-NNN`; status, owner, epic type, personas, and dates are filled.
- [ ] The name describes the value or problem space and survives a change in implementation.
- [ ] The primary segment is specific; adopter/buyer value is distinguished from end-user experience value.
- [ ] Persona references follow the wiki's local link convention and resolve.

## Evidence and value

- [ ] Evidence states what it proves and does not overclaim attribution.
- [ ] Every unproven value claim is labeled `[ASSUMPTION]`.
- [ ] The seven-part value hypothesis is complete.
- [ ] The epic's strategic role is explicit: parity, differentiation, risk, revenue, retention, adoption, or cost.
- [ ] The value path reaches a business outcome rather than stopping at activity, output, or UX.

## Measurement and falsification

- [ ] At least one business outcome has a population, target, timeframe, source, and owner, or the user's explicit decision not to set one is recorded.
- [ ] Leading indicators are separate from lagging business outcomes.
- [ ] Vanity metrics are diagnostic only unless their value path is explicit.
- [ ] Falsification names a negative result, validation window, and stop/pivot action.
- [ ] Insufficient evidence is distinguished from a negative result or remains an owned Open Question.

## MVP and scope

- [ ] MVP is the smallest credible test of value, with rollout and learning stated.
- [ ] Appetite is recorded when the user considers it relevant; otherwise its exclusion is explicit.
- [ ] Every scope item has an `S-*` ID and stays at capability/behavior level.
- [ ] Every out-of-scope item says why it is deferred and where it belongs.
- [ ] Scope does not duplicate or contradict another epic.
- [ ] Provider, API, schema, package, infrastructure, library, and hosting decisions remain in solution design.

## Stories and criteria

- [ ] Every story has a `US-*` ID, persona, want, and benefit.
- [ ] Every criterion has an `AC-*` ID, maps to a story, and uses Given/When/Then.
- [ ] Every story has coverage and no criterion references a missing story.
- [ ] Stories and criteria describe approved user/business behavior rather than technical design.

## Risks, questions, and wiki hygiene

- [ ] Every risk threatens the hypothesis and has a mitigation or explicit acceptance.
- [ ] Every open question has an owner and a `before <stage>` gate.
- [ ] Filename, index, log, Related Notes, persona backlinks, and renamed inbound links are current.
- [ ] Sources were preserved and stale downstream artifacts were reported rather than silently rewritten.
