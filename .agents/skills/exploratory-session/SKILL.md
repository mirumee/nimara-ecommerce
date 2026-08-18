---
name: exploratory-session
description: Run an evidence-first exploratory testing session against a newly shipped feature by driving the real Nimara storefront through the Playwright MCP, then write a session report an operator can act on. Use this skill whenever the user asks to explore a new feature on a test environment, run an exploratory/PLAYWRIGHT-MCP session, "test the new feature end to end before we write cases", or produce a session report for a feature just deployed. This is the first step of the new-feature flow; it precedes test-case design (use test-case-design) and E2E authoring. Do NOT use to retest a specific reported bug (use bug-retest-triage) or for a broad regression pass across an existing surface (use regression-sweep).
---

# Exploratory Session (Playwright MCP)

Explore a freshly shipped feature by driving the **real** application through the Playwright
MCP, discover how it actually behaves, and hand the operator an evidence-backed **session
report** — the input to test-case design and E2E authoring. Never fabricate behaviour, never
force a verdict. This is the AI half of the new-feature flow; the operator decides what happens
to the report.

## What the Playwright MCP is here

The Playwright MCP is the agent's hands and eyes on the running app: it navigates, reads the
page (accessibility tree / DOM, selectors), clicks, types, captures screenshots, and reads
console and network. It is a **harness for observation**, not a verdict engine — the same
evidence-only discipline as [[Bug Retest & Triage Process]] applies. The committed Playwright
E2E suite in `apps/automated-tests` is where confirmed behaviour is later encoded; this skill is
the exploratory pass that comes first.

## Operating principles

1. **Evidence only.** Every claim in the report is backed by an artifact (screenshot,
   DOM/selector capture, network response, measurement). "Looked fine" is not a finding — see
   [[Verdict & Evidence Policy]].
2. **Never fabricate.** Missing PRD detail, env URL, credentials, or test data = STOP and ASK,
   never guess or invent inputs.
3. **Right environment.** Test the deployed feature on the correct storefront and channel
   (`/` = US, `/gb` = GB), not the marketing site — see [[Environments & Access Matrix]].
4. **Cheapest reliable method.** Use the browser for what only the browser shows; drop to
   source/route/response inspection when it observes the behaviour more directly — see
   [[Test Method Playbooks]].
5. **Explore classes, not clicks.** Seed exploration from personas and the behaviour-driving
   axes ([[Coverage Maps]]), so the session covers the space rather than one happy path.
6. **No blocking dialogs.** Do not trigger native `alert`/`confirm`/`prompt`; they freeze the
   MCP. Read the console instead of alerting.
7. **Report, don't decide.** The session output is a report for the operator; it does not close
   tickets or approve the feature.

## Before you start

Confirm the inputs in [[Exploratory Session Inputs]] are present: the PRD (acceptance criteria,
scope, personas, risks), the feature is deployed to a reachable env, and the data/accounts the
journeys need exist. Anything missing is a stop-and-ask. Read [[Environments & Access Matrix]]
for the env/channel and credentials.

## Workflow

1. **UNDERSTAND** — read the PRD: acceptance criteria, scope/out-of-scope, personas, risks.
   State in your own words what the feature should do and what "correct" looks like as
   observable behaviour. Gaps in acceptance criteria = ASK trigger.
2. **PLAN** — write a lightweight plan to `qa/investigation/<feature>.md`: env URL + channel,
   accounts/data, the persona journeys to walk, and the behaviour-driving axes to probe
   (country, auth, payment outcome, field state) from [[Coverage Maps]].
3. **CHECK PREREQS — ASK IF BLOCKED.** Verify env reachable, credentials work, and the specific
   data exists before opening the browser. Missing/ambiguous → STOP and ASK, listing exactly
   what you need. Never fabricate.
4. **EXPLORE (Playwright MCP)** — walk each journey on the real app. At each meaningful step:
   read the page (accessibility tree / DOM, the role/label/test-id selectors the page objects
   in `apps/automated-tests/pages` already use), act, and observe. Capture the **application
   context** (URL, key selectors, DOM state) and decisive **screenshots**, plus console/network
   where the contract crosses them. Run a **control** for anything ambiguous or flaky
   ([[Known Flaky, Blocked & Backend-Only]]). Store artifacts under
   `qa/investigation/screenshots/<feature>/`.
5. **WRITE THE SESSION REPORT** — `qa/investigation/<feature>-session.md`: what was explored
   (journeys × axes), what was observed vs. the PRD's expected behaviour, discrepancies and
   suspected defects (generalised to classes, classified per [[Defect Taxonomy & Severity]]),
   the application context (selectors/DOM worth reusing for E2E), and explicit coverage gaps /
   anything blocked. Link every claim to its artifact.
6. **GUARD AGAINST HALLUCINATION.** Before handing off, re-check each finding against its
   artifact. A finding with no artifact is not a finding — drop it or re-observe. Flag anything
   you could not directly observe as requiring service-level or operator verification.
7. **HANDOFF** — report to the operator. On approval, the flow continues: derive a covering set
   with **test-case-design** ([Test Case](../../llm-wiki/_templates/TestCase.md) format), then
   encode confirmed behaviour as E2E specs in `apps/automated-tests`. This skill stops at the
   report.

## Output artifacts

- `qa/investigation/<feature>.md` — the session plan.
- `qa/investigation/screenshots/<feature>/` — evidence.
- `qa/investigation/<feature>-session.md` — the session report (the deliverable).

## References

[[Exploratory Session Inputs]] · [[Environments & Access Matrix]] · [[Coverage Maps]] · [[Test Method Playbooks]] · [[Test Data & Fixtures]] · [[Verdict & Evidence Policy]] · [[Defect Taxonomy & Severity]] · [[Known Flaky, Blocked & Backend-Only]] · [[Bug Retest & Triage Process]]
