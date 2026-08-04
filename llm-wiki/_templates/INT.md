---
type: "Template"
title: "INT Template"
description: "Reusable template for a current integration contract."
tags:
  - "template"
  - "integration"
created: "2026-07-17T14:13:11+02:00"
timestamp: "2026-07-20T00:00:00+00:00"
# The created record's `type`. It lives in `product/integrations/`, named
# `INT-NNNN <Title>.md`, with `id` matching the filename.
template_for: "Integration Contract"
id: "INT-0000"
# No `relations` field: CAP and FLOW link the integrations they use. Do not add a CAP or
# FLOW backlink.
# `candidate` → `active` ↔ `deprecated`. `candidate` may exist only on an unmerged change
# branch. Merge as `active` only with the code that makes the contract true. `deprecated`
# still describes available behavior; delete the record in the change that removes it. Git
# keeps the history and the ID is never reused. Register under Integrations in
# `product/Product (MOC).md` and `index.md`; append create, status-transition, and delete
# events to `log.md`.
status: "candidate"
# Engineering approves creation, mutation, and status transitions. Update the record
# atomically with contract changes, or in a separate evidence-backed knowledge repair.
owner: "github-user-or-team"
availability:
  # The first release tag, or exact 40-character SHA, where the record became active. This
  # is the record's only code anchor: no `Provenance` section and no commit permalinks. An
  # IMP listing this record under `relations.product_records` holds the evidence.
  since: null
  # `null` while active, otherwise the tag or SHA that deprecated the record.
  deprecated_since: null
---

# Purpose

# Authentication and permissions

# Events and operations

# Failure handling and idempotency

# Limitations
