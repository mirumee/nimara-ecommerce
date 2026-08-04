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
- **Provenance**: Discharged the multi-tenancy re-anchor obligation. PR 741 merged as squash commit `e0dee7b3baf55684917217e69533964bb0bbb499` on `main`, so the 13 permalinks in INT-0005 and OPS-0002 moved off pre-merge commit `9e9f0ad1b0d10ea2f2a0773a2736d9344843df2f` and the pending-change notes were removed.
- **Update**: Recorded in INT-0005 that webhook endpoints are one per provider account rather than one per channel, that channels sharing a secret key share an endpoint and its signing secret, and that the endpoint address carries the commerce domain while the channel travels in event metadata.
- **Update**: Recorded in INT-0005 that a provider account delivers to every endpoint subscribed on it, so an installation sharing an account receives the other's events and acknowledges them before any signature check. Checking first fails for a legitimate delivery regardless of ordering, because each endpoint signs with its own secret.
- **Update**: Reconciled OPS-0002 with the endpoint-per-account arrangement — the save step, the endpoint verification address, the shared-account acknowledgement behaviour, and the re-save needed to retire endpoints registered at the former per-channel address.
- **Update**: Recorded the endpoint-address migration in OPS-0002: endpoints predating the change answer 404 until each installation saves configuration once, during which the provider retries and transaction reports do not arrive.
- **Update**: Noted in IMP-0002 that provider accounts are distinguished by secret key rather than account identity, and corrected its code paths for the moved webhook route.
- **Provenance**: Anchored the endpoint-per-account claims in INT-0005 and OPS-0002 to commit `75be94ef01917a6952c1c32e9dd9da8577402d5f`, the tip of unmerged branch `feat/consolidate-stripe-webhook-endpoints-per-domain` ([PR 743](https://github.com/mirumee/nimara-ecommerce/pull/743)). They replaced the pending-change notes written while that work was uncommitted, and must be re-anchored on the squash-merge commit once it lands.
- **Provenance correction**: IMP-0001 recorded that no pull request existed and anchored its work item to branch commit `ebc9e3b8044dc48532d9c32902c584a7589ea6e9`. That work landed as [PR 736](https://github.com/mirumee/nimara-ecommerce/pull/736), squash-merged as `f346b80465337bb5f7c5e900eb93748991dc9506`; the work item, pull-request list, and the deviation explaining its status were corrected. It stays `in_progress` because browser verification remains incomplete.
- **Update**: Recorded in IMP-0002 that the webhook-endpoint follow-up is open as PR 743 rather than uncommitted.
- **Index**: Refreshed and embedded the QMD collection after the webhook-endpoint file-back.

## 2026-08-04

- **Create**: Added ADR-0002 as a proposed decision that the payment application selects where it
  stores the configuration of every installed commerce instance: a hosted store, which stays the
  default and the only option for a deployment, or an on-disk file for a developer machine. Anchored
  to commit `2680feabd8fc0cc5efdd680a2d78fed778c6ed8b` on unmerged branch
  `NIM-56-stripe-app-file-config-provider`, tracked as NIM-56.
- **Create**: Added IMP-0003 for that work at `in_progress`, anchored to the same commit with a null
  pull-request URL because no pull request exists yet. It stays below `implemented` because the
  schema requires a test path against an acceptance criterion and every criterion lists none.
- **Update**: Recorded in INT-0005 that stored configuration is reached through a selected backend
  rather than through Vercel Edge Config unconditionally, that the on-disk option cannot serve a
  deployment because a serverless filesystem is per-instance and does not survive, and that nothing
  in the application refuses that selection. The shared stored value and its last-write-wins
  property are unchanged and now hold for either backend.
- **Update**: Replaced the Vercel-values precondition in OPS-0002 with the storage selection and its
  startup failure, added an explicit prohibition on the on-disk backend for deployments, and added
  escalation paths for installations that vanish after succeeding and for a forbidden read or write
  against the hosted store.
- **Correction**: OPS-0002 claimed that the application `.env.example` omits required Vercel values
  and uses the older `ENVIRONMENT` name. That commit rewrote the example file, so the remark and its
  instruction to validate against the schema instead of the example were removed.
- **Provenance**: Discharged the endpoint-per-account re-anchor obligation recorded on 2026-08-03.
  PR 743 merged as squash commit `46b0c275332d5abd58d773cfc70ee2933020fa75` on `main`, so the eight
  permalinks in INT-0005 and OPS-0002 moved off pre-merge commit
  `75be94ef01917a6952c1c32e9dd9da8577402d5f` and the pending-change notes were removed. The four
  anchored paths were verified to exist at the merge commit.
- **Provenance gap**: The storage-selection claims in ADR-0002, IMP-0003, INT-0005, and OPS-0002 come
  from unmerged branch `NIM-56-stripe-app-file-config-provider` and must be re-anchored on the
  squash-merge commit once it lands, along with IMP-0003's `work_item` and its empty pull-request
  list.
- **Gap**: The change ships no unit test. The tenant rules that decide whether one installation can
  read another's credentials were moved from the Edge Config backend into a shared core with no test
  asserting they still hold, and neither backend is exercised. Recorded as a deviation in IMP-0003
  and as a consequence in ADR-0002; it is the blocker for `implemented`.
- **Lint**: Verified 91 Markdown files and 502 local links with no unresolved target, and confirmed
  no record still anchors the retired pre-merge commit `75be94ef…`.
- **Index**: The QMD collection was not refreshed for this checkout. `nimara-wiki` resolves to
  `/Users/lukasz/.codex/worktrees/61df/nimara-ecommerce/llm-wiki`, an unrelated worktree, so
  `wiki:qmd:update` indexed nothing and QMD retrieval does not reflect this wiki. Local developer
  state only; re-run `wiki:qmd:setup` from this checkout, then `wiki:qmd:embed`.
- **Provenance gap**: Thirteen anchors in INT-0005, CAP-0007, FLOW-0001, and OPS-0002 still point at
  `ebc9e3b8044dc48532d9c32902c584a7589ea6e9`, which no longer exists in the repository, as recorded
  on 2026-07-30. That work landed as [PR 736](https://github.com/mirumee/nimara-ecommerce/pull/736),
  squash-merged as `f346b80465337bb5f7c5e900eb93748991dc9506`. The permalinks are dead and the
  re-anchor was not performed here: it touches records outside this change and each anchored path
  needs verifying at the merge commit.
- **Schema change**: Current-state records no longer carry provenance. The `Provenance` section was
  removed from all 23 records that had one — CAP-0002 through CAP-0007, INT-0003 through INT-0007,
  FLOW-0001 through FLOW-0004, and OPS-0001 through OPS-0008 — deleting 417 lines and every commit
  permalink in them. A record describes what is true at the commit that contains it, so an embedded
  permalink was a second copy of that answer with its own decay: five re-anchor obligations were
  opened and discharged across four days, thirteen anchors went dead when a branch was rewritten,
  and one snapshot commit had to be maintained across twenty records. The rule is now in
  `AGENTS.md` under Source of truth. The sections were never part of `_templates/`.
- **Accepted loss**: `availability.since` is now the only code anchor on a current-state record.
  Two claim layers in INT-0005 had no other home — the `v1.7.1` base at
  `b500390914b794015e8db37975ce4cbbb27cb6e6` and the recheck at
  `75d6bc55edddf431adcc348009a1c226f77cc005` — and no IMP covers them. Layers with an IMP keep it:
  IMP-0001, IMP-0002, and IMP-0003 hold the stored-payment-method, multi-tenancy, and
  storage-selection anchors and are reachable from `index.md`.
- **Provenance gap**: The obligations recorded on 2026-07-29, 2026-08-03, and earlier today for
  CAP, FLOW, INT, and OPS are discharged by deletion, not by re-anchoring. The dead `ebc9e3b8…`
  anchors are gone with them. IMP-0003's `work_item` and empty pull-request list still point at
  unmerged branch `NIM-56-stripe-app-file-config-provider` and still need re-anchoring on merge;
  ADR-0002 keeps its anchor, as both record types are meant to.
- **Not changed**: `product/overview/Product Overview.md` is not one of the four contract types and
  keeps ten commit permalinks, eight of them at `75d6bc55…`. It is now the only current-state prose
  in the wiki that anchors code, and the last reader of that snapshot commit.
- **Schema change**: The record contracts moved out of `AGENTS.md` into the templates. Its
  `Concept Document Format` section was eight `###` blocks restating what each record type
  requires; it is now a table linking each record type to its template. The 144 lines of rules
  became YAML comments on the fields they govern in `_templates/PRD.md`, `RFC.md`, `ADR.md`,
  `IMP.md`, `CAP.md`, `FLOW.md`, `INT.md`, and `OPS.md` — location and filename on
  `template_for`, allowed statuses and registration on `status`, approvers on `owner`, link shape
  on the relation field, following the commented style `Undefined.md` already used. A rule stated
  in two places drifts; an agent creating a record opens the template anyway, so the template is
  where the contract is read and `AGENTS.md` keeps only what spans record types.
- **Correction**: Two templates were missing fields their own contract required, which the move
  exposed because every rule now has to attach to a field. `IMP.md` had no `work_item`, `code`,
  `verification`, `rollout`, or `rollback`; `PRD.md` had no `personas`. Both were filled in with
  empty scaffolding matching the shape the existing records use. A record created from either
  template before today started out incomplete.
- **Dropped**: The `Required additions` bullet is gone from all eight contracts. It listed the
  fields the record must carry, which the template now carries literally.
- **Schema change**: `code.paths` was removed from the IMP contract and from IMP-0001, IMP-0002,
  and IMP-0003, deleting 32 path entries. `code` now holds `pull_requests` only. A path list
  duplicates what the pull request already records and rots on the next rename or move, which is
  the same failure the `Provenance` sections had. An `implemented` record now needs at least one
  pull request, criterion, and test. All three records are `in_progress`, so none was immutable.
  With `paths` gone, `code` held one key, so it was flattened away: the field is now
  `pull_requests` at the top level of the frontmatter, in the slot `code` occupied.
- **Rename**: `_templates/prd.md` → `_templates/PRD.md`. `index.md`, `AGENTS.md`, and the
  `prd-modeling` skill all already spelled it `PRD.md`; only the file on disk did not. The
  `index.md` link resolved on a case-insensitive macOS filesystem and would have failed on Linux.
- **Edit**: The RFC template's opening note said `status` moves `draft` → `in_review` → `final`,
  which the contract block now states together with the approval requirement. The duplicate clause
  was dropped from the note; the rest of it, on what an RFC is and on provider neutrality, stands.
- **Lint**: Verified 91 Markdown files and every local link with no unresolved target, and
  confirmed no record carries a `Provenance` section.
