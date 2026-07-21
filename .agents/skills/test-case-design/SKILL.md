---
name: test-case-design
description: Turn a requirement, spec, or feature into a gap-free set of test cases by equivalence partitioning — enumerate the distinct behaviour classes, pick a representative per class, then run them and report. Use this skill whenever the user asks to design test cases, write a test plan, cover a feature "with no gaps", build equivalence classes/groups, or test a data-driven surface (like the checkout address fields) across many inputs. Produces a plan file plus a run report; can file findings as bugs. Do NOT use to retest an existing ticket (use bug-retest-triage).
---

# Test Case Design

Convert a requirement into a **complete** set of test cases — covering every distinct behaviour class, not random examples — then execute and report. This is how the address admin-area sweep found bugs an ad-hoc pass missed (MS-1238/1239/1240).

## Operating principles

1. **Partition, don't enumerate inputs.** Find the variables that change behaviour; group inputs into equivalence classes where every member behaves the same; cover each class with one representative + boundaries. See [[Coverage Maps]].
2. **Anchor to a source of truth.** For data-driven UIs, derive classes from the data (e.g. google-i18n-address `all.json` `require`/`sub_isoids`/`state_name_type`), not from guesses.
3. **No silent gaps.** Explicitly list every class and confirm each is covered; call out any class you deliberately skip and why.
4. **Reuse known behaviour.** Field-level validation behaviours are already documented in `MEMORY.md` and [[Test Data & Fixtures]] — don't re-derive.

## Workflow

1. **SCOPE** — restate the requirement; identify the behaviour-driving variables (channel, auth, country, payment outcome, field state…).
2. **PARTITION** — build the equivalence-class table: class → rule → expected behaviour → representatives (+ boundary/negative cases). Write it to `qa/triage/plans/<NAME>-tests.md`.
3. **PICK DATA** — choose verified fixtures per representative from [[Test Data & Fixtures]]; request any missing data/accounts (ASK, never fabricate).
4. **RUN** — execute each case with the cheapest reliable method ([[Test Method Playbooks]]); for data-driven UI, inspect the rendered control per representative (select vs text, required, sorted). Capture evidence → `qa/triage/evidence/<NAME>/results.md`.
5. **REPORT** — table of class → expected → actual → pass/fail, with the gap analysis (every class accounted for).
6. **FILE (if asked)** — generalise failures into **classes** and file bugs + a `[DEV]` spec ticket that `Blocks` them, per [[Defect Taxonomy & Severity]] and [[Jira & Board 74 Operating Manual]].

## References

[[Coverage Maps]] · [[Test Data & Fixtures]] · [[Test Method Playbooks]] · [[Defect Taxonomy & Severity]]
