---
type: "Map of Content"
title: "Operations (MOC)"
description: "Register and entry point for current runbooks, rollback procedures, and incident-response guidance."
tags:
  - "operations"
  - "moc"
  - "index"
created: "2026-07-20T00:00:00+00:00"
timestamp: "2026-07-21T00:00:00+00:00"
---

## Content

Operational records explain how to operate, observe, and recover the current system. They
change with or before the implementation that requires them and point to the implementation
and product-state records they support.

## Register

<!-- Newest last. Format: - OPS-NNNN Title - kind - status - one-line summary -->

- [OPS-0001 Storefront Deployment and Configuration Validation](OPS-0001%20Storefront%20Deployment%20and%20Configuration%20Validation.md) - runbook - active - Validates storefront configuration, plans Vercel changes, deploys an immutable ref, and verifies the environment.
- [OPS-0002 Stripe Payment Application Installation and Key Rotation](OPS-0002%20Stripe%20Payment%20Application%20Installation%20and%20Key%20Rotation.md) - runbook - active - Installs the payment application, configures channel keys, rotates webhooks, and verifies standard checkout.
- [OPS-0003 Marketplace Ledger Migration and Settlement Reconciliation](OPS-0003%20Marketplace%20Ledger%20Migration%20and%20Settlement%20Reconciliation.md) - runbook - active - Migrates the optional ledger database and reconciles open proceeds with Stripe settlement state.
- [OPS-0004 Marketplace Payout Batch Execution and Recovery](OPS-0004%20Marketplace%20Payout%20Batch%20Execution%20and%20Recovery.md) - runbook - active - Closes reviewed payable periods, executes connected-account Transfers, and handles partial outcomes.
- [OPS-0005 Marketplace Payment Completion Incident Response](OPS-0005%20Marketplace%20Payment%20Completion%20Incident%20Response.md) - incident_response - active - Reconciles successful marketplace payments with missing, partial, or vendor-invisible orders.
- [OPS-0006 Storefront Provider Change and Rollback](OPS-0006%20Storefront%20Provider%20Change%20and%20Rollback.md) - rollback - active - Changes build-time search or content providers and restores a known-good provider deployment.
- [OPS-0007 Saleor Schema Regeneration and Compatibility Check](OPS-0007%20Saleor%20Schema%20Regeneration%20and%20Compatibility%20Check.md) - runbook - active - Regenerates GraphQL clients, reviews compatibility, and refreshes schema-note evidence.
- [OPS-0008 Release Promotion and Production Rollback](OPS-0008%20Release%20Promotion%20and%20Production%20Rollback.md) - rollback - active - Promotes a verified release through protected branches and restores the prior immutable deployment when production regresses.

## Related Notes

[Implementation (MOC)](../tech/implementation/Implementation%20%28MOC%29.md)
[Product (MOC)](../product/Product%20%28MOC%29.md)
[Quality & Testing (MOC)](../quality/Quality%20%26%20Testing%20%28MOC%29.md)
