---
type: "Template"
title: "CAP Template"
description: "Reusable template for a current product capability."
tags:
  - "template"
  - "capability"
created: "2026-07-17T14:13:11+02:00"
# The created record's `type`. It lives in `product/capabilities/`, named
# `CAP-NNNN <Title>.md`. The filename is the record's identity; there is no `id` field.
template_for: "Product Capability"
relations:
  # Relative Markdown links to every INT record the capability requires. Do not add a FLOW
  # backlink; a FLOW links the capabilities it uses.
  integrations: []
# `candidate` → `active` ↔ `deprecated`. `candidate` may exist only on an unmerged change
# branch. Merge as `active` only with the code that makes the capability true. `deprecated`
# still describes available behavior; delete the record in the change that removes the
# behavior. Git keeps the history and the ID is never reused. Register under Capabilities in
# `product/Product (MOC).md` and `index.md`; append create, status-transition, and delete
# events to `log.md`.
status: "candidate"
# Product and Engineering approve creation, mutation, and status transitions. Update the
# record atomically with behavior changes, or in a separate evidence-backed knowledge repair.
owner: "github-user-or-team"
availability:
  # The first release tag, or exact 40-character SHA, where the record became active. This
  # is the record's only code anchor: no `Provenance` section and no commit permalinks. An
  # IMP listing this record under `relations.product_records` holds the evidence.
  since: null
  # `null` while active, otherwise the tag or SHA that deprecated the record.
  deprecated_since: null
---

# Behavior

# Actors

# Inputs and outputs

# Constraints and failure behavior
