---
name: epic-definition
description: Define a SAFe Epic as a polished Epic Hypothesis Statement through a structured, business-value-first interview, then deliver it as a downloadable document. Use this skill whenever the user wants to write, draft, define, scope, or refine an epic; capture or pressure-test the business value of a large initiative; turn a feature idea, business case, or opportunity into an epic; or prepare an epic that user stories will later be decomposed from. Trigger even when the user just says "help me write an epic," "what's the business value of X," "frame this initiative," or "I need an epic hypothesis statement," and even if they don't say "SAFe." Do not use for writing the user stories themselves — this skill stops at a finished epic.
---

# Epic Definition

Turn a rough idea, opportunity, or feature request into a rigorous **SAFe Epic Hypothesis Statement** that leads with measurable business value. The output is a markdown (.md) document saved in the llm-wiki/epics/ directory.

The single most important job of this skill is to **not let business value stay vague**. Most people describe an epic in terms of the solution they already imagined ("build a dashboard," "migrate to the cloud"). This skill repeatedly redirects the conversation from *solution* back to *value* — who benefits, by how much, how we'll measure it, and what would prove us wrong.

## Operating principles

1. **Value before solution.** An epic is a *hypothesis*, not a build order. The user almost always arrives with a solution in mind. Acknowledge it, then move the conversation to the problem and the value. The solution is just the current best guess at how to capture that value. Personas are defined in the llm-wiki/personas/ directory; if the user doesn't specify a persona, ask them to pick one. If epic doesn't match a persona, ask them to clarify. If the user is unsure, help them pick the most relevant one.
2. **Circle back relentlessly.** Every time the user gives a vague value claim ("save time," "improve experience," "stay competitive"), drill it with one concrete follow-up before moving on. Quantify, attribute, and find evidence. See `references/value-interrogation.md` for the challenge moves.
3. **Interview in rounds, not interrogations.** Ask in focused batches of 3–5 questions per round. Wait for answers. Reflect back what you heard before the next round. Many short rounds beat one giant questionnaire.
4. **Make it falsifiable.** A good hypothesis can be proven wrong. Always extract leading indicators and a clear statement of what result would invalidate the epic.
5. **Stop at the epic.** Do not write user stories, acceptance criteria, or a sprint plan. Produce a finished epic that is *decomposable*. The MVP and business outcomes are the natural seams future stories will follow.

## Workflow

### Step 0 — Read the template
Before interviewing, read `references/safe-epic-template.md` so you know exactly which fields you are filling and what "good" looks like for each. Read `references/value-interrogation.md` for the question bank you'll draw on throughout.

### Step 1 — Capture the raw input
Ask the user to dump what they have, however messy: the idea, the trigger, any data, any constraints. Extract whatever you can from this and from the existing conversation before asking anything. Then tell them, briefly, what you already understood so they only fill gaps.

### Step 2 — Run the interview in rounds
Move through these rounds. Each round has a purpose; skip a question only if the answer is already clearly known. Keep redirecting from solution to value.

**Round A — Problem & opportunity.** What's the problem or opportunity? Who feels the pain, and how often? What's the cost of doing nothing? What evidence do we have it's real (data, complaints, lost deals, support tickets)?

**Round B — Target customer & need.** Who exactly is this *for*? (A specific segment, not "users.") What job are they trying to do? Is the value to the end user, the buyer, or our own business — and how does one convert into the other?

**Round C — Business value (the core round — spend the most time here).** What measurable benefit do we expect? Push every soft claim into a number, a population, and a frequency. Use the value-laddering and "so what?" moves from the question bank. Separate *lagging business outcomes* (revenue, cost, retention, risk) from the activity that drives them. Ask how confident we are and why.

**Round D — Solution hypothesis (kept deliberately light).** Given the value, what's the proposed solution *category* — and what's the smallest version (MVP) that would test whether the value is real? Frame it as a bet, not a commitment.

**Round E — Differentiation.** Versus the current state or alternatives, why is this better? What's the one thing that makes it worth doing now rather than later?

**Round F — Leading indicators & falsifiability.** What early, measurable signals (weeks, not quarters) would tell us the hypothesis is tracking? What result would make us pivot or kill the epic?

**Round G — Constraints & NFRs.** Nonfunctional requirements (performance, security, compliance, scale), hard constraints, dependencies, and known risks.

After each round, reflect the answers back in one or two sentences and flag anything still vague. If a value claim is still soft, do not advance — ask one more drilling question.

### Step 3 — Synthesize and confirm
Draft the full Epic Hypothesis Statement using the template. Show it to the user **in chat first** as a draft. Explicitly call out:
- The one-sentence value statement (the "For… who… the… is a… that… unlike… our solution…" elevator pitch).
- The business outcomes and which are quantified vs. still assumptions.
- Anything you had to assume or invent — mark it clearly as `[ASSUMPTION]` so they can correct it.

Ask for corrections before generating the file.

### Step 4 — Produce the document
Once confirmed, generate the deliverable:
- **Default to .md** — write the markdown file directly, following the template structure in `references/safe-epic-template.md`.
- Only produce **.docx** if the user explicitly asks for a Word document; in that case use the **docx skill** (read its SKILL.md first).
Save to `/mnt/user-data/outputs/` and present it with `present_files`.

## Quality bar — an epic is not done until

- The value statement names a **specific customer**, not "users."
- At least one business outcome is **quantified** (number + population + timeframe) — or explicitly flagged as an unvalidated assumption to be tested by the MVP.
- Business outcomes (lagging) are distinguished from leading indicators (early signals).
- There is a clear statement of **what would prove the hypothesis wrong**.
- The MVP is the *smallest* thing that tests the value, not the full build.
- Every solution-y claim has been traced back to the value it serves.
- Assumptions are labeled, not hidden.

If any of these is missing, you haven't finished the interview — go back and ask.

## Common failure modes to avoid

- **Accepting "save time" / "improve UX" / "increase efficiency" at face value.** These are not business value until quantified and attributed. Always ask "how much, for whom, worth what?"
- **Letting the solution define the epic.** "Build X" is not an epic. The epic is the value X is hypothesized to deliver.
- **Writing stories.** Tempting once value is clear — resist it. Stop at the epic.
- **Confusing output with outcome.** "Ship the feature" is output. "Reduce churn 2 points" is an outcome. The epic is owned by the outcome.
- **One mega-questionnaire.** Overwhelms the user and produces shallow answers. Use rounds.

## Reference files
- `references/safe-epic-template.md` — the exact SAFe Epic Hypothesis Statement structure, field-by-field definitions, and a fully worked example.
- `references/value-interrogation.md` — the question bank and challenge moves for circling on business value (quantification, value-laddering, counterfactuals, proxy checks, confidence calibration).
