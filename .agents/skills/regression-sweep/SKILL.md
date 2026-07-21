---
name: regression-sweep
description: Run a broad health check across a Nimara surface — checkout, SEO/metadata, performance, or a page-type matrix — and report findings, instead of verifying one ticket. Use this skill whenever the user asks for a regression pass, a smoke/health check, a "sweep" of an area, a performance audit (Lighthouse), an SEO/meta check, or "test everything on <page/flow>". Fans out across page types, channels, and devices, then summarises pass/fail with evidence. Do NOT use to retest a specific reported bug (use bug-retest-triage) or to design cases from a spec (use test-case-design).
---

# Regression Sweep

Run a broad, repeatable health check across a surface and report — breadth over depth. Use this for "is anything broken across X" rather than a single defect.

## Operating principles

1. **Cover the matrix.** Enumerate the axes for the surface (page type × channel × device × env) and sweep representatives — don't spot-check one page. See [[Coverage Maps]].
2. **Cheapest reliable method per signal.** curl+grep for SEO/structural, local Lighthouse for perf, Playwright for interactive flows, response listeners for contracts. See [[Test Method Playbooks]].
3. **Right environment.** Test the real storefronts (dev/stage/demo), not the `nimara.store` landing page; mind channel prefixes (`/` = US, `/gb` = GB). See [[Environments & Access Matrix]].
4. **Report findings, don't auto-file.** Summarise pass/fail with evidence; only open tickets when the user asks, generalising to classes.

## Workflow

1. **PICK SURFACE & AXES** — e.g. SEO across {Home, PLP, PDP, CMS} × {US, GB}; or perf across {dev, stage, demo} × {Home, PLP, PDP} × {mobile, desktop}; or checkout smoke across {US, GB} × {guest, logged-in}.
2. **BASELINE (if any)** — note prior scores/expected values to compare against.
3. **SWEEP** — run each cell with its method; capture evidence under `qa/triage/evidence/<sweep-name>/`. Independent cells parallelise well.
4. **REPORT** — matrix of cell → result → delta-from-baseline; flag regressions and known-flaky cells ([[Known Flaky, Blocked & Backend-Only]]); record method caveats (perf fluctuates, code-inspection vs deployed build).
5. **HANDOFF (if asked)** — turn confirmed regressions into bugs via [[Defect Taxonomy & Severity]] + [[Jira & Board 74 Operating Manual]].

## References

[[Coverage Maps]] · [[Test Method Playbooks]] · [[Environments & Access Matrix]] · [[Known Flaky, Blocked & Backend-Only]]
