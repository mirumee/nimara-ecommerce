**Summary**: The rules for reaching a defensible verdict — evidence only, "could not reproduce" is not "fixed", use controls and caveats, and never fabricate or force a result.

**Tags**: #qa #verdict #evidence #policy #integrity
**Created**: 2026-06-30T00:00:00+00:00
**Last Updated**: 2026-06-30T00:00:00+00:00

---
## Content

### Core principles
1. **Evidence only.** Every verdict is backed by an artifact (screenshot, measurement, JSON, response capture) saved under `qa/triage/evidence/<KEY>/`. State the env/channel/build.
2. **Never fabricate** repro steps, data, or credentials. Missing input is an ASK, not a guess.
3. **Don't force a verdict.** If it's ambiguous/blocked → leave it `In testing`, ASK, flag for review.

### "Could not reproduce" ≠ "Fixed"
For flaky/intermittent defects (caches, races), failing to reproduce is **weak** evidence. Before calling it Fixed:
- Run a **control** to prove the feature works when given the chance, isolating the defect condition.
- Repeat N times for non-deterministic bugs.
- If you still can't trigger it, write **"could not reproduce after N attempts"** with the method, and add a caveat — or hand to a dev. Don't silently upgrade to Fixed.

### Method-specific caveats to record
- **Code-inspection verdicts**: repo HEAD may differ from the deployed build — say so.
- **Throttled/timing tests**: note the throttle profile and that real networks vary.
- **Perf**: note the tool (local Lighthouse), env, and that scores fluctuate run-to-run.
- **Partial fixes**: if a ticket reports 2 issues and only 1 is fixed → still `Open`, list which half remains (e.g. MS-1061, MS-1131).

### Comment hygiene
Factual, one or two lines, **no AI/automation/tool references**. Examples:
- "Retested on dev (GB): no longer reproduces — <one line>."
- "Retested on dev (GB): still reproduces — <one line>."

### Outcome vocabulary (for `worklist.json` `retest_status`)
`fixed` · `still_reproduces` · `still_reproduces_partial` · `blocked_needs_human` · `routed_to_dev` · `inconclusive` · `pending`.

## Related Notes
[[Quality & Testing (MOC)]]
[[Bug Retest & Triage Process]]
[[Known Flaky, Blocked & Backend-Only]]
