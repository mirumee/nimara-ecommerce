---
type: "Template"
title: "RFC Design Doc"
description: "Template for a Nimara RFC design document — a proposal covering problem, requirements, proposed solution, and cross-cutting considerations."
tags:
  - "template"
  - "rfc"
  - "design-doc"
created: "2026-07-13T00:00:00+00:00"
timestamp: "2026-07-13T00:00:00+00:00"
status: "Draft"
owner: ""
template_for: "Design Doc"
---

# Design Title

> An RFC is a proposal — a full design page for a non-trivial change. It does not
> record the verdict or the result: the decision and its outcome are captured in an
> [ADR](ADR.md). `status` moves Draft → In Review → Final. Keep Nimara
> designs OSS provider-agnostic: layer over existing provider abstractions, do not
> mandate a vendor.

## Problem

Brief description of the problem the design solves. State facts and forces, not the chosen solution.

## Requirements

### Functional requirements

- Functional requirement — short description of what the design must do.

### Non-functional requirements

- Non-functional requirement — short description (e.g. performance, scalability, cost).

## Proposed solution

Detailed description of the proposed solution with any diagrams, schemas, tables, or images needed. A visual (e.g. a flow diagram) usually adds more clarity than text alone. Split into sub-sections to emphasize aspects that need special attention.

### Component changes

#### Existing components

Existing components that must change, each with how it changes to satisfy the design.

#### New components

New components to create, each with a short description.

### API changes

Internal or external API changes. Small: show a diff of the endpoint. Large: define with OpenAPI or ReDoc.
**Nimara:** expose changes through infrastructure use-cases and services, not the raw Saleor schema.

### Database changes

Schema changes such as a new table or field. Note backward-compatibility and the migration strategy.

## Cross-cutting considerations

### Security

Changes that have or may have an impact on system security — e.g. sensitive-data storage, or an auth change.

### Monitoring and alerting

Elements that need monitoring and how. Rules that trigger alerts in production.

### Failure cases and remediation

Expected failure scenarios and their resolutions.

### Alternative solutions

Pros and cons for every viable alternative considered, including why it was not chosen. An alternative may also be a separate RFC proposing a different approach — link it here.

### Dependencies

Dependencies the design relies on, each with a short description.
**Nimara:** never add a package dependency automatically — propose it with alternatives and wait for approval.

### System impacts

Services affected and how, including any impact on external systems.

### Documentation changes

Documents that need changes, how and where. Note any new documents required.

### QA validation

Test scenarios that validate the solution. Whether each is automatable is the QA team's call, not the RFC's.

### DevOps / infrastructure

Infrastructure changes required (firewall rules, env vars, Terraform, CI task-graph).
