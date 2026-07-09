# Wiki index

Global content catalogue — every markdown note in the wiki, grouped by domain, with a
one-line summary. **Read this first when answering a query** to locate relevant notes, then
drill into them. Machine-maintained: the `wiki-maintenance` skill updates it on every ingest
(see `AGENTS.md`). Per-domain MOCs (`… (MOC)`) curate navigation *within* a domain; this file
is the exhaustive catalogue *across* domains.

> JSON data (`epics/`, `tasks/`, `solution/`) is a structured data layer, not synthesised
> notes, and is intentionally not catalogued here (see `AGENTS.md` → Deliberate deviations).

## sources/ — raw, immutable inputs
- [[Strategic Product Report - Nimara.store (Gemini Deep Research)]] — the Deep Research report the 2026 strategy/market corpus was synthesised from (full text pending archival).

## strategy/
- [[Product Strategy 2026 (MOC)]] — MOC + executive summary for the 2026 product strategy; entry point for all strategy notes.
- [[Initiative Prioritization]] — ranked scoring of the five recommended initiatives across impact, fit, timing, and effort/risk; master index for the initiative notes.
- [[Marketplace & Agentic Commerce Bets]] — evaluation of the two 2026 bets (marketplace, agentic commerce), credible v1s, and failure modes.
- [[Top-of-Funnel Adoption Moves]] — smallest set of high-leverage moves to accelerate open-source developer adoption.
- [[Do Not Pursue]] — initiatives Nimara should explicitly avoid to protect its code-first, composable, open-source positioning.
- [[Open Questions & Assumptions]] — assumptions the strategy rests on and the evidence that would change the recommendations.

## market/ — external research
- [[Composable Commerce Market]] — sector maturity and the self-hosted open-source economics above the ~$2–10M revenue threshold.
- [[Competitor Landscape]] — 2026 positioning, architecture, momentum, and DX of platforms Nimara competes with.
- [[Table Stakes vs Differentiators]] — what is commoditized versus Nimara's genuine 2026 differentiators.
- [[Emerging Trends 2026]] — agentic commerce & UCP/MCP, multi-vendor marketplaces, and "deploy in minutes" DX.
- [[Developer Pain Points]] — community/GitHub evidence of ecosystem dissatisfaction Nimara can capture.

## personas/
- [[Storefront Developer]] — PRIMARY: TypeScript/Next.js developer adopting Nimara to ship a production Saleor storefront.
- [[Ecommerce Manager]] — SECONDARY: business operator managing catalog, channels, content, taxes, orders via dashboards.
- [[Marketplace Vendor]] — SECONDARY: third-party seller managing products, orders, fulfillment via the Vendor Panel.
- [[Shopper]] — EXPERIENCE: end buyer browsing a Nimara store pre-purchase; the storefront quality bar.
- [[Customer]] — EXPERIENCE: end buyer post-purchase; the quality bar for fulfillment comms, reviews, account features.
- [[QA Engineer (Test Agent)]] — the QA persona this wiki serves; verifies on evidence and never fabricates a result.
- [[Anti-Persona - No-Code Solo Merchant]] — ANTI-PERSONA: no-code solo merchant Nimara explicitly does not build for.

## qa/ — quality & testing
- [[Quality & Testing (MOC)]] — MOC and entry point for QA; how agents test, retest, and report defects. Start here.
- [[Bug Retest & Triage Process]] — canonical per-ticket retest flow on a live shared board, plus the live-queue selection loop.
- [[Jira & Board 74 Operating Manual]] — how to operate Jira board 74 (project MS): status mapping, transitions, fields, gotchas.
- [[Environments & Access Matrix]] — which environments/channels exist, what's reachable, what needs credentials, what is backend-only.
- [[Coverage Maps]] — equivalence partitions for key surfaces so agents test classes of behaviour, not random cases.
- [[Defect Taxonomy & Severity]] — shared vocabulary for classifying defects (type + area) and assigning severity.
- [[Test Data & Fixtures]] — reusable verified test data: Stripe cards, addresses, postcodes, per-channel products, i18n-address rules.
- [[Test Method Playbooks]] — cheapest reliable technique per defect class (races, API contracts, visual, perf, dev-only warnings).
- [[Verdict & Evidence Policy]] — rules for a defensible verdict: evidence only, controls and caveats, never force a result.
- [[Known Flaky, Blocked & Backend-Only]] — where not to burn cycles or force a verdict: flaky areas, no-access, backend-only defects.

## decisions/ — architecture decision records
- [[Decisions MOC]] — MOC and chronological register of ADRs and their rationale.
- [[ADR-0001 Standalone Reviews Service with a Stateless Storefront]] — Accepted: reviews live in a standalone service; the storefront stays stateless, reaching them only via the ReviewProvider contract over HTTP.

## references/ — provenance
- [[Works Cited]] — source list for the 2026 product strategy research (Gemini Deep Research, accessed 2026-06-16).
