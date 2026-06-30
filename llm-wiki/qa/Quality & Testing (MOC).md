**Summary**: Map-of-content and entry point for Quality Assurance — how agents (and people) test, retest, and report defects on Nimara. Start here.

**Tags**: #qa #testing #moc #index #agents
**Created**: 2026-06-30T00:00:00+00:00
**Last Updated**: 2026-06-30T00:00:00+00:00

---
## Content

### What this section is for
This is the QA brain for **agents working on Nimara**. Read it before touching a test or a Jira ticket so you don't rediscover the environment, the board mechanics, or the verdict rules the hard way. Knowledge lives in these notes; the executable runbooks live as skills under `skills/qa/`.

> Pairing convention (same as the rest of this wiki): notes = read-context, **skills = runbooks** that cite them. The QA skills read these notes the way `epic-definition` reads `[[Storefront Developer]]`.

### Read-me-first (the 80%)
1. [[Environments & Access Matrix]] — which env, which channel, what you can/can't reach. **Biggest source of wasted effort if skipped.**
2. [[Jira & Board 74 Operating Manual]] — column↔status mapping, transition IDs, required fields, comment rules.
3. [[Bug Retest & Triage Process]] — the canonical retest flow (claim only after prereqs, evidence-only verdicts).

### Methods & data
- [[Test Method Playbooks]] — for bug class X, use technique Y (throttling, response inspection, geometry, Lighthouse, code inspection…).
- [[Test Data & Fixtures]] — Stripe cards, addresses, postcodes, known products, i18n address rules.
- [[Coverage Maps]] — equivalence partitions so you test *classes*, not random cases.

### Discipline
- [[Verdict & Evidence Policy]] — evidence-only; "could not reproduce" ≠ "fixed".
- [[Defect Taxonomy & Severity]] — how to classify and prioritise what you find.
- [[Known Flaky, Blocked & Backend-Only]] — where NOT to force a verdict.

### Who does this
- [[QA Engineer (Test Agent)]] — the persona this section serves.

### Skills (runbooks)
- `skills/qa/bug-retest-triage` — one ticket, full retest flow.
- `skills/qa/test-case-design` — equivalence-partition a feature into a covering test set.
- `skills/qa/regression-sweep` — broad health check across a surface (SEO, perf, page-type matrix).

### Where the work is recorded
Live QA artifacts sit in the repo at `qa/triage/`: `plans/<KEY>.md`, `evidence/<KEY>/`, `worklist.json` (per-ticket state), `jira-actions.json` (append-only action log). The retest protocol is also encoded in repo `CLAUDE.md`. Prior E2E findings live in the agent memory `MEMORY.md`.

## Related Notes
[[Environments & Access Matrix]]
[[Jira & Board 74 Operating Manual]]
[[Bug Retest & Triage Process]]
[[QA Engineer (Test Agent)]]
[[Product Strategy 2026 (MOC)]]
