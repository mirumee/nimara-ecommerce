---
type: "Template"
title: "IMP Template"
description: "Reusable template for implementation and verification evidence."
tags:
  - "template"
  - "implementation"
created: "2026-07-17T14:13:11+02:00"
# The created record's `type`. It lives in `tech/implementation/`, named
# `IMP-NNNN <Title>.md`. The filename is the record's identity; there is no `id` field.
template_for: "Implementation Record"
# `planned` → `in_progress` → `implemented`. A later code-revert change may move it from
# `implemented` to `rolled_back` and must set `relations.rolled_back_by`; no other transition
# out of `implemented` is allowed. After `implemented` the record is immutable except for
# that transition. Register in `index.md` and append create, status-transition, and rollback
# events to `log.md`. `tech/implementation/Implementation (MOC).md` is an unmaintained
# placeholder: do not add, update, or remove records there.
status: "planned"
# Engineering reviews creation and every status transition.
owner: "github-user-or-team"
work_item:
  # A non-empty public GitHub issue or pull-request identifier, or an exact 40-character Git
  # commit SHA.
  id: ""
  # The stable public URL of the issue or pull request; `null` only when `id` is a commit SHA.
  url: null
relations:
  # Relative Markdown links. `prds`, `rfcs`, and `adrs` may be empty when the work
  # legitimately required no such artifact.
  prds: []
  rfcs: []
  adrs: []
  # Every CAP, FLOW, INT, or OPS record this implementation changed. Those records carry no
  # commit permalinks, so this record is where the evidence for their claims lives.
  product_records: []
  # `null` unless a later IMP performs a code rollback of this one.
  rolled_back_by: null
# Stable public pull-request URLs. The pull request is the record of which files changed — do
# not restate them here, because a path list goes stale on the next refactor while the pull
# request stays accurate.
pull_requests: []
# One entry per acceptance criterion from the PRD or work item, each naming the test paths
# that cover it. An `implemented` record needs at least one pull request, criterion, and test.
verification:
  - criterion: ""
    tests: []
# What an operator must do to ship this safely, including required configuration and
# migration order.
rollout: ""
# How to undo it, and any state that makes the undo unsafe.
rollback: ""
---

# Implementation summary

# Deviations

# Verification evidence
