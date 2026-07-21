---
name: rfc-modeling
description: Turn an approved PRD into an RFC design proposal inside the LLM-wiki. Use when the user wants to design, draft, refine, or stress-test the technical solution for a PRD — an RFC, design doc, solution design, or "how do we build this". Deep-research the solution space, propose approaches, run a technical grilling one question at a time, and file an RFC that stops at a proposal — it does not make the decision (an ADR does) or write code.
---

# RFC Author

Turn an approved PRD into an explicit, reviewable **RFC** — a technical design _proposal_ for a non-trivial change. An RFC proposes; it does not decide. The verdict and outcome are captured later in an [ADR](../../../llm-wiki/tech/ADR/ADR%20MOC.md). Stop at a filed proposal; do not implement.

Follow these seven stages in order. The deep research, the technical grilling, and the self-lint are mandatory.

## Altitude — a proposal, not an implementation plan

An RFC is a _solution proposal_, not an implementation plan. Describe the **shape** of the solution: the load-bearing architectural principles (what layers over what, which boundaries are swappable, the dependency direction), the key decisions, and the important implementation gotchas and risks that could sink the design. Do **not** specify exact package or folder paths, file or function names, type signatures, or line-level structure — that belongs in implementation tickets and PRs. Concrete package placement may appear at most as a one-line, non-binding suggestion. When in doubt, ask "does a reviewer need this to judge the approach?" — if not, it is too low, and it constrains the implementer without earning its place.

## Clear technical prose — cut ornament, keep the register

Write the RFC as **clear, dense technical prose** for engineers — not a lay explainer. The register stays professional and precise; the goal is only to remove what makes writing hard to read, not to simplify the content:

- **Cut ornamental / pretentious jargon and convoluted sentences.** Drop words like "orthogonal", "load-bearing", "by construction", "idiomatic", "compose over", "degrade gracefully", "first-class" when a plainer word says the same thing. Untangle a sentence that has to be re-read.
- **Avoid double negatives; frame positively.** State what something does, not a chain of "never … that has not …". Prefer "the LLM can only surface products the search returned" over "the LLM never emits a product that has not been validated". A positive assertion is read once; a stacked negation is read twice.
- **State each fact once; do not restate requirements in other sections.** A requirement already captured in Problem / Requirements / an NFR does not get repeated in Component changes, API, etc. Each section states only what is new to it — Component changes describes the structural change, not the NFRs it satisfies. Repetition reads as padding.
- **Keep the full technical vocabulary.** Standard, ubiquitous terms — `SearchService`, "provider", "LLM", "stateless", "boundary", "endpoint", "fallback", "Result", "injected" — stay exactly as they are. Do **not** replace them with folksy paraphrases ("the search Nimara already has", "supplier", "swap point", "the feature stores nothing"); that adds words, loses precision, and insults the reader. Engineers know these terms.
- **Explain only the genuinely obscure**, once, on first use — do not gloss the everyday.
- **Name things so they explain themselves; do not coin jargon.** A heading or item that needs a gloss is the wrong name — "No invented products" beats "Grounding gate". Reserve coined terms for the one place a mechanism is defined, and do not spawn near-identical variants of them ("guard" vs "gate") for different things.
- **Match the source's actual words.** When a sentence cites a PRD section or requirement ID,
  say what that source says rather than drifting in paraphrase. Re-read the referenced passage
  before citing it.
- **Drop research-phase labels once a direction is chosen.** The winning option is "the design", not "Approach C" — the letters only meant something while the alternatives were side by side.

Cutting ornament does not lower the altitude, and it does not mean writing for a non-specialist: it means a precise sentence with no wasted or pretentious words.

## Stage 1 — Resolve the PRD and pull context

An RFC is always anchored to one PRD. Resolve it before anything else.

- If the user named a PRD, load it.
- If they did not, list the PRDs under `llm-wiki/prd/` and make the user pick one. Do not invent a PRD, and do not design against a loose feature idea — an RFC without a PRD has nothing to be falsified against.

Then read, before questioning the user:

- the PRD, especially its business bet, deferred technical decisions, and open questions;
- relevant personas, strategy, and market notes;
- existing ADRs and RFCs that overlap or constrain this design;
- the actual code and infrastructure the design touches — packages, layers, services, schema, config.

Use repository and source exploration to answer factual questions. Facts belong to exploration; decisions belong to the user. Never invent constraints, current behavior, or capabilities.

Completion criterion: the PRD is fixed, the deferred technical branches are collected, and the affected code/infra surface is understood before research begins.

## Stage 2 — Deep research and propose approaches

Read `references/research-brief.md` and follow it.

Spin up a **background research agent** (see the `research` pattern) so the main thread stays responsive. Investigate the solution space against **primary sources** — official docs, source code, specs, first-party APIs — not secondary write-ups. Follow every claim back to the source that owns it.

Return **2–3 candidate approaches**, each with: what it is, how it maps onto Nimara's layers, trade-offs, cost/complexity, and risks. Keep every approach **OSS provider-agnostic** — layer over existing provider abstractions; never mandate a vendor or lock the design to one SaaS.

**Name the decision drivers, and rank them.** Before presenting the approaches, state the criteria the choice is judged on — the ones that trace to the PRD's outcomes and NFRs (catalog validity, works-on-the-OSS-default, cost, latency, lock-in, operational burden, layer fit, …) — and mark the **two or three that dominate**; those break ties. Present each approach **scored against these ranked drivers**, not as a loose list of trade-offs. The dominant drivers are what make the eventual pick defensible rather than a matter of taste, and they become the RFC's non-functional requirements.

Then let the user choose the direction:

- The user generally picks the approach before the grilling starts.
- If research (or the grilling) shows only one approach is viable, present that one with its reasoning and confirm it — do not manufacture a fake choice.
- Rejected approaches are not discarded: they become the RFC's Alternative solutions, and any that deserves its own full design is flagged as a separate RFC.

Completion criterion: one approach is chosen (or the single viable approach is confirmed), and the rejected alternatives with reasons are recorded.

## Stage 3 — Run the technical grilling

Read `references/technical-grilling.md` and follow it completely.

Maintain an in-memory ledger as the grilling proceeds: for every question capture a `D-*` ID, the design branch, the question, the recommendation, the user's answer, and the resulting decision. Also capture rejected options, deferred decisions with an owner and gate, and any decision that belongs in the resolving ADR rather than the RFC.

Ask exactly one question per turn. Each question must:

1. resolve one design decision or challenge one hand-wavy technical claim;
2. include a recommended answer and short rationale;
3. wait for the user's answer before advancing.

Keep the grilling at **solution altitude** (see Altitude above): architectural principles, boundaries, and gotchas — not exact package/folder paths, file or function names, or signatures. Cover the base system and system of record, the ranked decision drivers, component changes as roles and boundaries, API surface (exposed through infrastructure use-cases and services, not the raw Saleor schema), data model and migration, security, monitoring and alerting, failure cases and remediation, dependencies, system impacts, documentation, QA validation, DevOps/infrastructure, and reversibility/blast radius. Do not re-litigate the business bet — that was settled in the PRD. Do not decide acceptance — that is the ADR.

If the user says a concern does not apply, record that as an explicit decision rather than inventing detail. If the user stops the questions, summarize decisions and unresolved branches and make no edits. Do not draft the RFC until the user confirms shared understanding; the original request to "write an RFC" does not bypass this gate.

Completion criterion: every branch in the technical-grilling completion gate is answered, deliberately deferred with an owner and gate, or explicitly rejected; the user has confirmed shared understanding.

## Stage 4 — Draft the RFC

Read the wiki template at `llm-wiki/_templates/RFC.md` and follow the wiki's local OKF schema and link convention. Do not duplicate the template inside this skill.

Draft in this order:

1. Problem (from the PRD, restated as the design problem — facts and forces, not the solution);
2. Requirements (functional and non-functional, derived from the PRD's outcomes and NFRs);
3. Proposed solution (the chosen approach: component changes, API changes, database changes);
4. Cross-cutting considerations (security, monitoring, failure cases, alternatives, dependencies, system impacts, docs, QA, DevOps).

Rules:

- Keep the draft at solution altitude (see Altitude): principles, boundaries, decisions, and gotchas — not exact package/folder paths, file/function names, or signatures. Package placement is at most a one-line, non-binding suggestion.
- Resolve every template and record link from the authored RFC location, `llm-wiki/tech/RFC/`, rather than from `llm-wiki/_templates/`. Keep record-specific path examples non-clickable until they are replaced with the real relation.
- Do not copy the template's explanatory blockquote (what an RFC is, the `draft → in_review → final` flow, generic provider-agnostic reminder) into the authored RFC — that meta lives in the RFC MOC and template. Open the instance with its own context (the PRD it serves); express real design constraints in the body, not as boilerplate.
- In Component changes, open with a **one-to-two-sentence scope note** — the repo and which app(s)/layers the change lands in, plus the plan in a line. Not a per-package breakdown, and no file-level layout.
- Describe what's new as **services / capabilities, concisely (often a single item)** — the new moving parts and their boundaries — not an inventory of literal "components" (the word reads as UI components; usually it is services). Group tightly-related new parts into one item rather than splitting each into its own bullet.
- Write clear, dense technical prose (see Clear technical prose): cut ornamental jargon and convoluted sentences, but keep the full technical vocabulary — it is for engineers, not a lay explainer.
- Put the rejected approaches under Alternative solutions with pros, cons, and why not chosen; cross-link any that becomes its own RFC.
- Keep the design provider-agnostic and route API/data changes through services, not the raw Saleor schema.
- **Dependencies lists actual new dependencies only** — a package or an external account the design would add. Something Nimara owns and writes itself is not a dependency; do not list it to fill the section. Present each as a **recommendation with its alternatives**, and do not write "pending approval" or "awaiting sign-off" in the RFC body: the whole RFC is a proposal, and the ADR is the approval. State the fact (new to this app; already used elsewhere in the monorepo) and stop.
- **Deferred decisions carry only this RFC's own unresolved items** — with an owner and a gate. If the PRD already tracks an open question, it stays tracked there; restating it in the RFC is duplication. Do not fabricate a resolution, and do not invent a gate: when citing a PRD open question, use the gate the PRD actually sets.
- **QA validation lists the test scenarios, not their automatability** — whether each is automatable is the QA team's call, not the RFC's.
- **Numbers carry their source** — any figure a reader could act on (pricing, latency, limits) links the primary source it came from, with the capture date and a "re-verify at implementation time" note. A number without a traceable source is an invented number.
- When a template section does not apply, say so in one sentence (or "None" / "N/A") and stop — do not pad it to look substantial. An honestly empty section beats invented detail.
- **The template is a guide, not a form.** Its sections are the usual shape of an RFC, not a mandatory checklist. Drop a section that does not apply, merge tightly-related ones, and add a section the design genuinely needs (e.g. a "For the ADR" list of acceptance questions, or an "Assumptions" block). What must survive is the content — problem, requirements, the proposed design, and the cross-cutting risks — not the exact headings.
- **Do not invent — verify before naming.** Never name a concrete tool, library, vendor, service, or capability that the repo does not already use and the user has not chosen. Grep the repo first; "it is the standard tool" is not grounding. If something is genuinely needed, it is a dependency: flag it for approval — do not slip it in as an example or a parenthetical. The same applies to constraints, current behavior, numbers, and defaults: if it was not established by repo exploration, by research with a cited source, or by a user decision, it does not go in the RFC. Padding a sentence with a plausible specific is the easiest way to put a lie in a design doc.

Completion criterion: the RFC expresses the chosen proposal and its alternatives without introducing decisions the user did not make, and without recording a verdict.

## Stage 5 — Self-lint

Run every check in `references/quality-checklist.md`. Fix issues that require no new decision. Put genuine unknowns in deferred items and report any failed checks rather than hiding them.

Completion criterion: every checklist item passes or is reported as an explicit, owned gap.

## Stage 6 — Bookkeeping

- Save as `llm-wiki/tech/RFC/<PRD Name>/RFC-NNNN <Title>.md` — one folder per PRD, holding its RFCs and their grilling logs side by side. Use the next free ID from the RFC register (monotonic across the whole register, not per PRD); preserve the ID when rewriting an existing RFC.
- **Write the grilling log.** Save the `D-*` ledger to `llm-wiki/tech/RFC/<PRD Name>/RFC-NNNN <Title> - Grilling Log.md`, created from `_templates/rfc-grilling-log.md` — the durable, user-visible decision trail (session context, base system + system of record, ranked drivers, the `D-*` table, chosen approach + rejected alternatives with their deciding driver, deferred items and owned open decisions, reversibility judgement, and the acceptance questions left for the ADR). It carries its own `D-*` numbering. Record decisions only — never hidden reasoning, secrets, or a confidential source body. Link it and its RFC to each other.
- Set `owner` to the RFC's author (the person creating this design), not inherited from the PRD — the PRD owner is the business owner; the RFC owner is the design author. Use the git author identity when the user does not name one.
- Register the RFC in `llm-wiki/tech/RFC/RFC MOC.md`.
- Set `prd` and the matching Related Notes entry to the same relative Markdown link, resolved from the RFC's authored location (`llm-wiki/tech/RFC/<PRD Name>/`), to the one PRD this RFC serves. Do not add a handwritten RFC backlink to the PRD.
- Update `llm-wiki/index.md` and append to `llm-wiki/log.md`.
- Preserve sources and downstream artifacts; report stale ones rather than silently rewriting them.

Completion criterion: the RFC links to its PRD from frontmatter and Related Notes, is in the register and root index, and no changed link points to an old name or resolves relative to `_templates/`.

## Stage 7 — Gate

New RFCs start as `status: draft`. A rewritten RFC changes status only when the user explicitly approves the transition (`draft → in_review → final`). Close with the file location, passed checks, open decisions, rejected alternatives, and the proposed next step: an ADR that accepts or rejects this RFC (and any competing RFCs for the same PRD) and links back to it. The ADR is self-contained — it pulls the RFCs' content inline as weighed alternatives rather than linking them — so it takes the RFCs and their grilling logs as input, and its own decision log continues the `D-*` sequence.

## References

- `references/research-brief.md` — how to run the deep research and the shape of the approach comparison.
- `references/technical-grilling.md` — mandatory sequential design interview and completion gate.
- `references/quality-checklist.md` — RFC Definition of Ready.
- `llm-wiki/_templates/RFC.md` in the target wiki — canonical RFC structure; do not duplicate it inside the skill.
- `llm-wiki/_templates/rfc-grilling-log.md` in the target wiki — the durable decision-trail structure filed beside each RFC.
