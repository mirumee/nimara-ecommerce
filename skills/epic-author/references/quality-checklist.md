# Epic quality checklist (Definition of Ready for review)

Run every check before presenting the draft. Fix silently what needs no new information; everything else becomes an Open Question or is reported to the user.

## Frontmatter & identity
- [ ] `id` follows `EPIC-NNN` and is unique in `epics/`
- [ ] `status: draft`, `owner`, `epic_type`, `created`/`updated` filled
- [ ] every persona in `personas:` is a wikilink resolving to an existing persona note

## Value & measurement
- [ ] Value hypothesis fills all seven slots (For / who / the / is a / that / unlike / our solution)
- [ ] At least one success metric with target and measurement source — and no invented numbers: if a target wasn't given by sources or the user, it's an open question
- [ ] Kill criterion present: what evidence stops or pivots this epic

## Scope
- [ ] Every scope item has an `S-n` ID
- [ ] Every out-of-scope item says why it's deferred and where it goes
- [ ] No scope item duplicates or contradicts another epic (check `epics/`)

## Stories & criteria
- [ ] Every story has `US-n` ID, persona, want, and benefit clause (INVEST spot-check: is it independently valuable and testable?)
- [ ] Every AC has `AC-n` ID, maps to a story `(US-m)`, and is Given/When/Then
- [ ] Every story is covered by at least one AC; no AC references a missing story

## Risks & questions
- [ ] Every risk has a mitigation or an explicit "accepted"
- [ ] Every open question has an owner and a "needed before <stage>" deadline

## Wiki hygiene
- [ ] Filename `EPIC-NNN <Name>.md` in `epics/`
- [ ] Related Notes links the seeding initiative/strategy note when one exists
- [ ] `index.md` / `log.md` updated if they exist
- [ ] Persona notes back-link to this epic
