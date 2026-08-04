---
type: "Template"
title: "FLOW Template"
description: "Reusable template for a current end-to-end product flow."
tags:
  - "template"
  - "flow"
created: "2026-07-17T14:13:11+02:00"
# The created record's `type`. It lives in `product/flows/`, named
# `FLOW-NNNN <Title>.md`. The filename is the record's identity; there is no `id` field.
template_for: "Product Flow"
relations:
  # Relative Markdown links to every CAP and INT record the flow uses.
  capabilities: []
  integrations: []
# `candidate` → `active` ↔ `deprecated`, with the same branch, merge, deletion, and
# ID-retention rules as CAP. Register under Flows in `product/Product (MOC).md` and
# `index.md`; append create, status-transition, and delete events to `log.md`.
status: "candidate"
# Product, Engineering, and QA approve creation, mutation, and status transitions. Update the
# record atomically with behavior changes, or in a separate evidence-backed knowledge repair.
owner: "github-user-or-team"
availability:
  # The first release tag, or exact 40-character SHA, where the record became active. This
  # is the record's only code anchor: no `Provenance` section and no commit permalinks. An
  # IMP listing this record under `relations.product_records` holds the evidence.
  since: null
  # `null` while active, otherwise the tag or SHA that deprecated the record.
  deprecated_since: null
# The roles the flow runs for, as short strings — a shopper, a vendor, an operator, an agent.
actors: []
---

# Preconditions

# Main flow

# Failure paths

# Result
