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

## 2026-07-23

- **Update**: Replaced branch-promotion guidance in OPS-0008 with the CI-gated release-from-trunk and production rollback procedure anchored to implementation commit `241c4bbfa932f0a672b9422aed98489aaba76d1c`.
- **Maintenance**: Reconciled the operations register, root index, and QA environment matrix with `main` as the only long-lived development branch.
- **Provenance correction**: Re-anchored OPS-0008 from the deleted migration branch to durable release commit `407da55cabebee44ec910d1a96261934b4cab963`.
- **Maintenance**: Documented the `Admins` team pull-request-only break-glass path; direct pushes to `main` have no bypass.

## 2026-07-28

- **Update**: Extended INT-0005 with the `MANAGE_USERS` permission, the four stored-payment-method events, the customer identity mapping rules, and the narrowed transaction-initialization payload.
- **Update**: Rewrote the saved-payment-method behavior, inputs, and constraints in CAP-0007, which previously described a storefront that held provider credentials and a privileged application token, and related it to INT-0005.
- **Update**: Recorded the saved-method precondition and payment-method ownership check in FLOW-0001.
- **Update**: Added the permission-change reinstallation step and saved-card verification to OPS-0002.

## 2026-07-29

- **Update**: Narrowed the INT-0005 customer identity mapping to private metadata only. The public
  metadata mapping written by earlier storefront releases is no longer read, because it is
  shopper-writable.
- **Update**: Recorded in INT-0005 and OPS-0002 that there is no migration path from the
  storefront-owned integration. The provider-side customer lookup was removed as well, so a
  carried-over shopper is issued a new gateway customer and re-enters their card once.
- **Update**: Recorded the redisplay-consent rule in INT-0005 and CAP-0007 — a stored method is
  listed only when consent to reuse it was captured as it was saved.
- **Correction**: A shared payment token is forwarded to the provider as before, not refused. It
  was briefly rejected on the reading that the parameter does not exist, which the provider SDK's
  types suggest but do not establish — they cover generally available parameters only, and the
  agentic checkout flow requires the token on every completion.
- **Update**: The storefront no longer holds a provider publishable key. The payment application
  reports the key for the channel with every session it opens, so per-channel accounts work
  without rebuilding the storefront.
- **Provenance gap**: The stored-payment-method claims in INT-0005, CAP-0007, FLOW-0001, and OPS-0002 come from branch `feat/saleor-stored-payment-methods`, staged and deliberately uncommitted, so they carry a pending-change note instead of a commit permalink and must be re-anchored on merge.
- **Not recorded**: The decision to move saved payment methods onto the stored payment methods protocol was not filed as an ADR, by request. The current-state records above describe the resulting contract; the rationale, the alternatives, and the trade-offs have no durable home in the wiki.
- **Blocked**: No IMP record was created. The schema requires `work_item.id` to be a public issue or pull-request identifier or an exact 40-character commit SHA, and the change has none yet.

## 2026-07-30

- **Create**: Added IMP-0001 for the stored-payment-method work, at `in_progress` against commit
  `ebc9e3b8044dc48532d9c32902c584a7589ea6e9`. It stays below `implemented` because no pull request
  exists and the schema requires one there. This clears the blocker recorded on 2026-07-29.
- **Provenance**: Re-anchored the stored-payment-method claims in INT-0005, CAP-0007, FLOW-0001,
  and OPS-0002 to that commit and removed the pending-change note from CAP-0007. The commit is the
  tip of an unmerged branch, so each anchor carries a re-anchor instruction: a rebase of that
  branch would strand the permalinks.
- **Update**: Recorded in INT-0005 that the browser SDK rejects a caller-supplied API version, so
  only the application's server-side version is under operator control, and that a session missing
  its gateway key or client secret fails where the session is opened rather than where the SDK
  loads.
- **Update**: Recorded in CAP-0007 that saved methods belong to one commerce channel and that the
  checkout's own channel, not the region the URL resolves to, decides which list is read.
- **Update**: Recorded checkout ownership in FLOW-0001 — a cart created while signed in is attached
  as it is created, a guest cart is attached at sign-in, and the storefront cannot verify ownership
  by reading the checkout because the customer field is permission-gated and checkouts are read
  anonymously.
- **Lint**: Repaired an empty list item at the end of the OPS-0002 provenance section and linked
  IMP-0001 from its previously empty `implementations` list.
- **Stale**: All seven `tech/saleor/` notes report `STALE` after `pnpm codegen` refreshed
  `packages/codegen/schema.ts` (stamped `496fcbeb16ea`, current `d5882535838f`). They were not
  restamped, because restamping asserts a review against the current schema that has not been done.
- **Not recorded**: The provider-neutral payment service contract is described in IMP-0001 only.
  It is an architecture decision with no ADR, by the same standing request as the protocol move.
- **Update**: Recorded in FLOW-0001 that an empty checkout clears the stale identifier and returns
  the shopper to the cart, alongside the unreadable-checkout case it already described.
- **Provenance gap**: That claim comes from an uncommitted working-tree change and has no anchor.
  The stored-payment-method anchors added earlier today point at `ebc9e3b8…`, which no longer
  exists after the branch was amended and rebased onto `54ed3a03`; the current tip is `3395b6bc`.
  Re-anchor every stored-payment-method link, and IMP-0001's `work_item.id`, on the merge commit.

## 2026-07-31

- **Create**: Added ADR-0001 as a proposed decision to disable promo codes in the storefront checkout while marketplace mode is enabled, anchored to implementation commits `445fbf993b29d90cd87f9e66b5b56a66e4b6f897` and `76e367e4a26e17c7a2e8270cab34a30a6701ea22` on an unmerged change branch.
- **Update**: Registered ADR-0001 in the ADR register and the root index, opening the previously empty ADR branch of the wiki.

## 2026-08-03

- **Create**: Added IMP-0002 for payment-application multi-tenancy, anchored to commit `9e9f0ad1b0d10ea2f2a0773a2736d9344843df2f` on unmerged branch `feat/saleor-stripe-app-multi-tenant` (PR 741), at `in_progress` because the pull request is open and the two-installation acceptance criterion is unverified.
- **Update**: Recorded the tenancy model in INT-0005 — one deployment serves many commerce installations keyed by commerce domain, gated by a fail-closed domain allowlist.
- **Correction**: INT-0005 previously stated that synchronous payment webhooks verify against the signing keys for the declared API issuer. Keys and callbacks are addressed from the commerce domain instead; a caller-declared API URL is no longer an input to verification, and the token issuer claim is not consulted.
- **Update**: Recorded in INT-0005 that stored configuration is keyed by commerce domain, that a single-installation value is read as a one-entry map, that the shared stored value makes concurrent saves last-write-wins, and that provider endpoint cleanup is scoped per installation.
- **Update**: Replaced the Saleor-API-URL precondition in OPS-0002 with the required `ALLOWED_DOMAINS` allowlist and its fail-closed behavior, and added the refused-installation step, the domain-scoped endpoint replacement, the two-installation verification, and the rollback constraint.
- **Schema change**: Removed the implementation-register requirement from the IMP contract in `AGENTS.md`. `tech/implementation/Implementation (MOC).md` is an unmaintained placeholder, so IMP records are registered in `index.md` only. The CAP, FLOW, INT, OPS, and ADR registers stay required and remain populated.
- **Provenance gap**: The multi-tenancy claims in INT-0005, OPS-0002, and IMP-0002 come from unmerged branch `feat/saleor-stripe-app-multi-tenant` and must be re-anchored on the squash-merge commit once PR 741 lands.
- **Index**: Refreshed and embedded the QMD collection after the multi-tenancy file-back.
