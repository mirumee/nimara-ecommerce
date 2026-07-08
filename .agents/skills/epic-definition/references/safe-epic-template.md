# SAFe Epic Hypothesis Statement — Template & Field Guide

This is the structure the epic must follow. Fill every field. Where a value isn't yet known, write `[ASSUMPTION: …]` rather than leaving it blank or inventing certainty.

## The template

```
EPIC HYPOTHESIS STATEMENT

Epic Name:        <short, memorable, solution-neutral name>
Epic Owner:       <person accountable for the outcome>
Type:             <Business epic | Enabler epic>
Date / State:     <funnel entry date; e.g., "Funnel" / "Reviewing" / "Analyzing">

— Value Statement (elevator pitch) —
For        <target customer / segment>
who        <statement of the need or opportunity>
the        <epic / solution name>
is a       <category of solution>
that       <key benefit / compelling reason / value delivered>
unlike     <current state or alternative>
our solution <statement of primary differentiation>

— Business Outcomes —
The measurable benefits the business expects if this hypothesis is proven true.
(Lagging indicators: revenue, cost, retention, risk, market share. Each with a
number, a population, and a timeframe.)
- <outcome 1>
- <outcome 2>

— Leading Indicators —
Early, measurable signals (weeks, not quarters) that show the hypothesis is
tracking toward the business outcomes. These are what you watch during the MVP.
- <indicator 1>
- <indicator 2>

— MVP —
The smallest, time-boxed solution that produces enough learning to prove or
disprove the hypothesis. Not the full build — the cheapest credible test.
<description>

— Hypothesis Falsification —
What result would prove this hypothesis wrong, or trigger a pivot/stop.
<statement>

— Nonfunctional Requirements (NFRs) —
Performance, security, compliance, scalability, accessibility constraints the
solution must respect.
- <nfr 1>

— Constraints, Dependencies & Risks —
- <constraint / dependency / risk>

— In Scope / Out of Scope —  (helps later story decomposition; not stories themselves)
In:  <capability areas inside this epic>
Out: <explicitly excluded>
```

## Field-by-field guidance

**Epic Name** — Name the *value or problem space*, not the implementation. "Faster onboarding for SMB customers" beats "New signup wizard." A good name survives even if the solution changes.

**Type** — *Business epic* delivers value directly to a customer or the business. *Enabler epic* builds the technical/architectural runway (infrastructure, compliance, refactors) that future business epics need. If the user is describing plumbing, it's probably an enabler — and its value statement should still tie to the business epics it unblocks.

**Value Statement** — The heart. The "For… who… the… is a… that… unlike… our solution…" form forces a specific customer, a specific need, a clear benefit, and a differentiator. If you can't fill the `For` with a real segment or the `that` with a concrete benefit, the interview isn't done.

**Business Outcomes** — These are *lagging* and *measurable*. "Improve retention" is not an outcome; "reduce 90-day churn from 8% to 6% within two quarters of GA" is. Every outcome needs number + population + timeframe, or an explicit `[ASSUMPTION]` tag noting it's the thing the MVP will test.

**Leading Indicators** — The early proxies. If the business outcome takes two quarters to show, what can you measure in three weeks that predicts it? (e.g., "activation rate of the new flow," "% of trials reaching first value.") These make the hypothesis testable before the full bet pays off.

**MVP** — The discipline test. It is the *minimum* needed to learn, not a smaller version of the whole thing. State what's deliberately excluded and what learning it buys.

**Hypothesis Falsification** — A real hypothesis can fail. Force a concrete "if we see X (or don't see Y) by date Z, we pivot or stop."

**NFRs / Constraints** — Capture the boundaries that any solution must honor, so they aren't rediscovered painfully during delivery.

**In/Out of Scope** — Not user stories. Coarse capability areas. They become the seams along which features and stories are later split.

## Worked example

```
EPIC HYPOTHESIS STATEMENT

Epic Name:    Self-serve onboarding for SMB customers
Epic Owner:   J. Rivera (Growth PM)
Type:         Business epic
Date / State: 2026-06-22 / Analyzing

— Value Statement —
For          new SMB customers (1–50 employees) signing up without a sales rep
who          currently abandon setup because it requires manual configuration
the          self-serve onboarding epic
is a         guided, in-product activation experience
that         gets them to first value within 10 minutes of signup
unlike       the current 3-day, support-assisted setup
our solution removes the human bottleneck and lets customers start unassisted.

— Business Outcomes —
- Increase 30-day SMB activation rate from 41% to 60% within 2 quarters of GA.
- Reduce onboarding support tickets per new SMB account by 50% within 1 quarter.
- [ASSUMPTION] Lift SMB trial-to-paid conversion by ~3 pts — to be validated by MVP.

— Leading Indicators —
- % of new SMB signups completing the guided flow (watch weekly).
- Median time from signup to first "aha" action.
- Support-ticket rate tagged "setup" in first 7 days.

— MVP —
Guided flow for the single most common SMB use case only, shown to 20% of new
SMB signups via experiment. Excludes advanced configuration and non-SMB segments.
Buys: evidence on whether self-serve activation beats assisted setup.

— Hypothesis Falsification —
If guided-flow completers do NOT activate at a higher 30-day rate than the
assisted-setup control after 6 weeks, the self-serve hypothesis is wrong — revisit.

— NFRs —
- Flow must load in <2s on median mobile connection.
- No PII stored client-side; SOC 2 logging on all setup events.

— Constraints, Dependencies & Risks —
- Depends on the new entitlements service (Q3).
- Risk: SMB segment may be too heterogeneous for one guided path.

— In Scope / Out of Scope —
In:  guided activation, in-product checklist, setup telemetry.
Out: enterprise onboarding, billing changes, data migration tooling.
```
