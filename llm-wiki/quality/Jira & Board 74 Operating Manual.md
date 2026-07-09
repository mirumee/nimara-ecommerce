---
type: "QA Reference"
title: "Jira & Board 74 Operating Manual"
description: "How to operate Jira board 74 (project MS) correctly — the column↔status mapping, transition IDs, required fields, labels, and the comment/mention gotchas that trip up agents."
tags:
  - "qa"
  - "jira"
  - "board74"
  - "workflow"
  - "agents"
created: "2026-06-30T00:00:00+00:00"
timestamp: "2026-06-30T00:00:00+00:00"
---

## Content

Project key: **MS** (Nimara Legacy). Bugs live on **board 74**. Use `jira_get_board_issues(74, jql)` to see what's actually on the board (its filter applied) — `statusCategory` JQL is NOT the same as a board column.

### Board column ↔ status mapping (NOT the status name)
| Board column | Status to set |
|---|---|
| To Fix | `Open` |
| In Progress | `In testing` |
| Fixed | `Done` |
| **To Do** | catches statuses **unmapped** to any other column (e.g. `On Stage`, `In Progress`) |

> Gotcha learned the hard way: the literal status `In Progress` is **not** the In Progress column (that's `In testing`). Always confirm the mapping before "move it to column X".

### Transition IDs (project MS bug workflow)
`Open`=**23** · `In testing`=**25** · `Done`=**31** · `In Progress`=**11** · `To Do`=**22** · `To refine`=**17** · `Blocked`=**3** · `In Review`=**24**. Always `jira_get_transitions` first if unsure.

### Creating a bug — required fields & conventions
- **Environment is required**: `customfield_10044` (multi-checkbox). Set e.g. `[{"value":"DEV"},{"value":"STAGE"}]`. Allowed values include `DEV`, `STAGE`.
- Labels: `FE`, `BC:checkout` (component-ish), `dev_verify` (needs a developer to verify), `BC:erp`, `BE`.
- New bugs land in `To refine` and may be **auto-assigned by a project rule** (don't fight it).

### Comment & mention rules (agent-specific)
- **No AI/automation/tool references** in ticket comments — write as a QA engineer would.
- **Secrets/credentials**: always request them wrapped in backticks/code — markdown mangles `*`/`_` (this corrupted shared creds twice).
- `jira_transition_issue`'s `comment` param expects **ADF**, not plain text → it errors. Post the comment **separately** via `jira_add_comment`.
- **@-mentions don't notify** via the API here — `jira_get_user_profile`/email can't resolve an accountId (privacy mode) and watcher-by-email fails. "@Name" is plain text only. To truly notify: get the person's Atlassian **accountId**, or have a human @-mention once in the UI.
- Linking: dev/spec ticket **`Blocks`** the bug(s). For "Blocks": `outward` = blocks, `inward` = is blocked by → set the spec as the outward issue.

### Status semantics for retest verdicts
- Defect still reproduces → `Open` (To Fix).
- Defect no longer reproduces → `Done` (Fixed).
- Blocked / inconclusive / needs input → leave in `In testing`, ASK, flag for review. Never force a verdict. (See [Verdict & Evidence Policy](quality/Verdict%20%26%20Evidence%20Policy.md).)

## Related Notes
[Quality & Testing (MOC)](quality/Quality%20%26%20Testing%20%28MOC%29.md)
[Bug Retest & Triage Process](quality/Bug%20Retest%20%26%20Triage%20Process.md)
[Verdict & Evidence Policy](quality/Verdict%20%26%20Evidence%20Policy.md)
