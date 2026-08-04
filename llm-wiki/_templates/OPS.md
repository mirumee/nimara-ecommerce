---
type: "Template"
title: "OPS Template"
description: "Reusable template for operational knowledge and runbooks."
tags:
  - "template"
  - "operations"
created: "2026-07-17T14:13:11+02:00"
timestamp: "2026-07-20T00:00:00+00:00"
# The created record's `type`. It lives in `operations/`, named `OPS-NNNN <Title>.md`, with
# `id` matching the filename.
template_for: "Operational Record"
id: "OPS-0000"
# `draft` → `active` ↔ `deprecated`. Merge `active` guidance with, or before, the code that
# requires it. Delete the record when it no longer applies; Git keeps the history and the ID
# is never reused. Register in `operations/Operations (MOC).md` and `index.md`; append
# create, status-transition, and delete events to `log.md`.
status: "draft"
# Operations/Platform approve creation, mutation, and status transitions. Update the record
# atomically with operational behavior, or in a separate evidence-backed knowledge repair.
owner: "github-user-or-team"
# Exactly one of `runbook`, `rollback`, or `incident_response`.
kind: "runbook"
relations:
  # Relative Markdown links to the IMP records and the CAP/FLOW/INT records this guidance
  # supports. At least one of the two lists must be non-empty. `implementations` carries the
  # link to the code evidence: this record holds no commit permalinks of its own.
  implementations: []
  product_records: []
---

# Trigger

# Preconditions

# Procedure

# Verification

# Escalation
