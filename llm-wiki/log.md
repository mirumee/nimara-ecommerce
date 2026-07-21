# Directory Update Log

## 2026-07-21

- **Maintenance**: Removed source-specific workflow material and rewrote retained QA knowledge as tracker-neutral, code-grounded guidance.
- **Maintenance**: Repaired template and root-index links without adding source stubs or ephemeral-source references.
- **Create**: Added CAP-0001 and CAP-0002 as candidate current-product capabilities during evidence-backed knowledge repair.
- **Status transition**: Marked CAP-0001 active from `v2.1.0` and CAP-0002 active from `v2.0.0` after verifying the corresponding release snapshots.
- **Create**: Added INT-0001 through INT-0004 as candidate integration contracts during evidence-backed knowledge repair.
- **Status transition**: Marked INT-0001 and INT-0002 active from `v2.1.0`, and INT-0003 and INT-0004 active from `v2.0.0`, after verifying the corresponding release snapshots.
- **Create**: Added the Nimara Product Overview as a code-grounded map of actors, app surfaces, architecture, behavior, integrations, and current boundaries.
- **Create**: Added CAP-0003 through CAP-0007 as candidate current-product capabilities during evidence-backed knowledge repair.
- **Status transition**: Marked CAP-0003 active from `v1.0.0`, CAP-0007 active from `v1.3.0`, and CAP-0004 through CAP-0006 active from `v2.0.0` after verifying their release snapshots.
- **Create**: Added FLOW-0001 through FLOW-0004 as candidate end-to-end product flows during evidence-backed knowledge repair.
- **Status transition**: Marked FLOW-0001 active from `v1.7.1` and FLOW-0002 through FLOW-0004 active from `v2.0.0` after verifying their release snapshots.
- **Create**: Added INT-0005 through INT-0007 as candidate integration contracts during evidence-backed knowledge repair.
- **Status transition**: Marked INT-0005 active from `v1.7.1`, INT-0006 active from `v1.0.0`, and INT-0007 active from `v2.0.0` after verifying their release snapshots.
- **Ingest**: Synthesized the current product overview, capabilities, flows, and integration contracts from public repository code, immutable release tags, commit SHAs, pull requests, and automated tests.
- **Lint**: Verified 77 Markdown files, 407 local links, and all 18 product records with no graph, schema, registration, or source-anonymization failures.
- **Lint**: Verified 74 immutable product-provenance links and all 7 Saleor schema notes without a failed or stale result.
- **Index**: Refreshed and embedded the QMD collection after product-state and maintenance updates.
- **Create**: Added OPS-0001 through OPS-0008 as draft operational records for deployment, payment application setup, ledger and payouts, payment incidents, provider rollback, Saleor schema maintenance, and release recovery.
- **Status transition**: Marked OPS-0001 through OPS-0008 active after verifying their procedures, limitations, product relations, and immutable code provenance against the current repository snapshot.
- **Ingest**: Populated the operations branch with current runbooks, rollback guidance, and incident response derived from deployment and release configuration, application routes, migration scripts, payment state machines, and schema tooling.
- **Lint**: Verified 85 Markdown files, 453 local links, and all 8 OPS schemas and registrations with no graph or source-anonymization failures.
- **Lint**: Verified all 32 immutable OPS provenance links and all 7 Saleor schema notes without a failed or stale result.
- **Index**: Refreshed and embedded the QMD collection after the operations ingest.
