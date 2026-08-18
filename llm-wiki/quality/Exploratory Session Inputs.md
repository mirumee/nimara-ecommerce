---
type: "QA Note"
title: "Exploratory Session Inputs"
description: "What an AI-driven exploratory testing session needs as input for a new feature, and how much of it the current PRD template already supplies."
tags:
  - "qa"
  - "exploratory"
  - "prd"
  - "readiness"
  - "agents"
created: "2026-08-10T08:28:14+00:00"
---

## Content

The new-feature flow starts an **exploratory session** the moment a feature reaches a test
environment. An agent can only explore usefully if the inputs below are present. This note is
the checklist the [exploratory-session skill](Quality%20%26%20Testing%20%28MOC%29.md) reads,
and the readiness bar a PRD must clear before it triggers a session.

### Required inputs

1. **What "correct" means** — the feature's acceptance criteria and user stories, concrete
   enough to turn into a pass/fail observation. Without them a session produces description,
   not verdicts.
2. **Scope boundaries** — what is in and out of this release, so the agent explores the shipped
   slice and does not file out-of-scope behaviour as defects.
3. **Personas & primary journeys** — who the feature is for and the paths they take, to seed
   exploration instead of random clicking.
4. **Environment & channel** — where the feature is deployed and under which channel — see
   [Environments & Access Matrix](Environments%20%26%20Access%20Matrix.md).
5. **Data & fixtures** — the accounts, cards, and addresses the journeys need — see
   [Test Data & Fixtures](Test%20Data%20%26%20Fixtures.md). Missing data is a stop-and-ask, never
   a fabrication.
6. **Behaviour-driving variables** — the axes that partition behaviour (country, auth, payment
   outcome, field state), so exploration covers classes — see
   [Coverage Maps](Coverage%20Maps.md).
7. **Known risks & open questions** — where the feature is expected to be fragile, to focus
   the session.

### PRD template coverage (readiness review)

Reviewed against `_templates/PRD.md`. The PRD is the primary input to the session, so its
format has to carry most of the above.

| Required input | PRD field that supplies it | Status |
| --- | --- | --- |
| What "correct" means | `Acceptance Criteria`, `User Stories` | **Covered** |
| Scope boundaries | `Scope`, `Out of Scope` | **Covered** |
| Personas & journeys | `personas` frontmatter, `User Stories` | **Covered** |
| Behaviour-driving variables | — (implicit in ACs) | **Partial** — not enumerated as axes; the session must derive them from [Coverage Maps](Coverage%20Maps.md). |
| Known risks / open questions | `Risks`, `Open Questions` | **Covered** |
| Environment & channel | — | **Gap** — a PRD is env-agnostic. Comes from [Environments & Access Matrix](Environments%20%26%20Access%20Matrix.md) + the deploy, not the PRD. |
| Data & fixtures | — | **Gap** — comes from [Test Data & Fixtures](Test%20Data%20%26%20Fixtures.md), not the PRD. |

**Conclusion.** The current PRD format supplies what defines *correctness* (acceptance
criteria, scope, personas, risks) and is sufficient to start a session. The two gaps —
environment/channel and concrete test data — are correctly owned by QA notes, not the PRD;
the session composes the PRD with those notes rather than expecting the PRD to duplicate them.
The one soft spot inside the PRD is that behaviour-driving variables are implicit in the
acceptance criteria; the session derives explicit equivalence classes from
[Coverage Maps](Coverage%20Maps.md) rather than reading them off the PRD. No PRD-template
change is required to unblock the flow.

## Related Notes

[Quality & Testing (MOC)](Quality%20%26%20Testing%20%28MOC%29.md)
[Coverage Maps](Coverage%20Maps.md)
[Environments & Access Matrix](Environments%20%26%20Access%20Matrix.md)
[Test Data & Fixtures](Test%20Data%20%26%20Fixtures.md)
[Verdict & Evidence Policy](Verdict%20%26%20Evidence%20Policy.md)
