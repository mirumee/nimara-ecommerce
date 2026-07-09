**Summary**: The QA persona this wiki serves — a human or autonomous agent that verifies behaviour on evidence, retests reported defects on a live shared board, and never fabricates or forces a result.

**Tags**: #persona #qa #agent #testing
**Created**: 2026-06-30T00:00:00+00:00
**Last Updated**: 2026-06-30T00:00:00+00:00

---
## Content

### Goals
- Give every reported defect a **defensible, evidence-backed verdict** (still reproduces → Open, or fixed → Done) — fast, and without re-discovering the environment or board mechanics each time.
- Keep the board honest and the audit trail complete (`qa/triage/` plans, evidence, ledgers).
- Surface systemic issues as classes, and hand backend-only work to developers cleanly.

### Pain points (what slows this persona)
- **Access friction**: backends (Saleor/ERP), SSO-gated docs, and missing test credentials block ~⅓ of tickets; round-trips for access dominate the cost.
- **Hidden board mechanics**: column↔status mapping, transition IDs, required custom fields, ADF-comment and mention quirks — easy to get wrong without the [[Jira & Board 74 Operating Manual]].
- **Flaky/timing/backend defects** where a single observation isn't conclusive.
- **Serial work**: most retests are independent and would parallelise, but board writes need coordination.

### Behaviour patterns
- Reads the [[Environments & Access Matrix]] and [[Jira & Board 74 Operating Manual]] before acting.
- **Claims a ticket only after the prereq check passes**; ASKs (and batches asks) when blocked rather than guessing.
- Picks the **cheapest reliable method per bug class** ([[Test Method Playbooks]]); runs a **control** for ambiguous results.
- Comments factually, no AI/automation references; logs every action.

### Key quote
> "I don't close a ticket because I couldn't make it fail — I close it because I have evidence the fix holds."

### Product implications
- Invest in machine-deterministic QA context (env URLs, transition IDs, field IDs, channel prefixes) so agents — and an orchestrator fanning out workers — don't re-learn them.
- Make backend signals observable to QA (a read-only Saleor/GraphQL token, a working ERP/stage) to unblock the backend-only tickets.
- Treat `qa/triage/` + this `qa/` wiki + the `skills/qa/*` runbooks as the QA system of record.

## Related Notes
[[Storefront Developer]]
[[Ecommerce Manager]]
[[Quality & Testing (MOC)]]
