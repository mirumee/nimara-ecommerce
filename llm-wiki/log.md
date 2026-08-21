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
- **Schema change**: The `id` field is gone from every record and every template — 34 records and 8
  templates. The filename carries the identifier, so the field was a second copy of it kept in sync
  by hand. Nothing resolved a record by `id`: every relation, every register line, and every
  cross-link is a relative Markdown path. `work_item.id` in an IMP is unaffected — it names a
  GitHub issue or pull request, not the record.
- **Not affected**: References like `INT-0005` in earlier `log.md` entries still resolve, because
  the identifier stayed in the filename. Only the frontmatter copy was removed.
- **Consequence**: A record can no longer be found by grepping for its identifier in frontmatter
  after a rename — the filename is the single point of identity, so a rename is now the one
  operation that can orphan inbound links. That raises the value of a link lint and lowers the
  value of an ID lint: filename-versus-field drift is no longer possible.
- **Schema change**: The `timestamp` field is gone from all 88 notes that carried it, the whole
  wiki rather than the records alone. It claimed when a note last changed and had to be updated by
  hand, so it did not: it disagreed with the last commit touching its file in 27 of 34 records —
  seven OPS records still read `2026-07-21` after edits on `2026-08-04`.
  `git log -1 --format=%cs -- <path>` answers the same question exactly and for free.
- **Kept**: `created` stays. It disagreed with Git in 6 of 34 records, but in the informative
  direction — PRD-001 was authored `2026-07-10` and committed `2026-07-21`, and Git cannot know
  the earlier date. It is written once and never maintained, unlike the field that was removed.
- **Registered**: Both rules are now in `AGENTS.md` under Source of truth, so neither field is
  reintroduced by the next agent that notices its absence.
- **Lint**: Verified 91 Markdown files, 506 local links with no unresolved target, and frontmatter
  parsing on every file after the field removals.
- **Rename**: `_templates/prd.md` → `_templates/PRD.md`. `index.md`, `AGENTS.md`, and the
  `prd-modeling` skill all already spelled it `PRD.md`; only the file on disk did not. The
  `index.md` link resolved on a case-insensitive macOS filesystem and would have failed on Linux.
- **Edit**: The RFC template's opening note said `status` moves `draft` → `in_review` → `final`,
  which the contract block now states together with the approval requirement. The duplicate clause
  was dropped from the note; the rest of it, on what an RFC is and on provider neutrality, stands.
- **Lint**: Verified 91 Markdown files and every local link with no unresolved target, and
  confirmed no record carries a `Provenance` section.
- **Tooling**: Added `pnpm wiki:lint` and `pnpm wiki:index:sync`, both in
  `scripts/wiki-lint.mjs`, driven by the new [`_schema.json`](_schema.json). Twelve rules cover
  frontmatter against the record contracts, link and anchor integrity, orphans, and register
  coverage. Every violation is an error and the only way to silence one is an `except` entry
  carrying a reason. Deliberately not wired into CI: it runs by hand, so `AGENTS.md` and the
  `llm-wiki-bookkeeping` skill now name it as the step that closes a wiki change.
- **Rationale**: The rules were unenforced, and the wiki had already proved they rot. This run
  found what the previous four days found by hand: a case-sensitive link break, a register
  claiming to be empty while three records existed, thirteen dead anchors, two templates missing
  fields their own contract required, and a field that disagreed with Git in 27 of 34 records.
  `_schema.json` is the machine-readable half of the contracts in `_templates/`; both must change
  together, which is a second copy accepted on purpose so that a template missing a field fails
  rather than redefining the requirement.
- **Correction**: `_templates/saleor-schema-note.md` declared `type: "Saleor Schema Note"` and no
  `template_for`, unlike the other nine templates. It read as a real note rather than a template.
  Now `type: "Template"` with `template_for: "Saleor Schema Note"`. This was the only violation
  the first clean run reported.
- **Dependency**: `yaml@2.8.3` added to root `devDependencies`, pinned to the version already in
  `pnpm-lock.yaml` so the store gains nothing — `pnpm add yaml` had resolved `2.9.0` and rewritten
  116 lockfile lines by re-keying the Tailwind and Vite peer chains. Approved for this purpose:
  the tool that judges every other file must not misparse them, and the wiki's frontmatter uses
  single-quote escaping and inline comments that a hand-rolled parser gets wrong.
- **Deferred**: No rule yet enforces the `Provenance` ban recorded earlier today, and the 15 commit
  SHAs in 6 files are unchecked for reachability. Cross-record consistency — IMP relation targets,
  ADR supersession, filename-ID uniqueness — is also unimplemented. Both were scoped out of the
  first version.
- **Verification**: The linter was then exercised against throwaway fixture wikis — a `--root`
  flag was added for it, so no test mutates `llm-wiki/`. Forty-one assertions cover every rule
  firing, every rule staying silent on a clean tree, and the register sync inserting, pruning,
  preserving order, and staying idempotent. The suite is not committed; it lives outside the repo,
  so nothing repeats the proof automatically. The output reports how many files each rule
  examined, so a rule that quietly stops matching is still visible.
- **Fixed while testing**: three defects the real wiki could not surface. A register named in the
  schema but absent from the tree crashed with an unhandled `ENOENT` instead of reporting; a note
  registered twice was accepted silently and would have been collapsed by the next sync without a
  word; and an unresolved relation link was reported twice, once as `bad-relation-link` and once
  as `link-unresolved`. Frontmatter is still scanned for links, because an IMP's `rollback` prose
  carries them, so the duplicate is suppressed by target rather than by skipping frontmatter.
- **Lint**: `pnpm wiki:lint` reports 0 violations across 91 files; `pnpm wiki:index:sync` reports
  all 6 registers already in sync.
- **Maintenance**: `AGENTS.md` had two tables listing the record types — a glossary of what each
  one is for, and a map from each one to its template. Adding a type meant editing both. They are
  now one `Knowledge model` table with Record, Responsibility, and Template, and the
  `Concept Document Format` section is gone. Two rows were added so the table answers the question
  by itself: the Saleor schema note, and `Anything else` for a generic concept, both of which were
  loose prose under the old template table. No `Directory` column: the folder tree above and the
  `template_for` comment in each template already carry it, and a third copy would be the first to
  drift. Row order still follows the Workflow diagram below it rather than the alphabet. The
  frontmatter `description` said "glossary", which no longer names a section, and now says
  "knowledge model".
- **Maintenance**: Added a `Skills` section to `AGENTS.md` naming the four repo-local skills that
  work on this directory, what each owns, and what it may write to. It replaces the opening
  paragraph of `Maintaining The Wiki`, which said the same thing in prose for two of them and
  deferred the other two to "their specialized skills" without naming them.
- **Recorded**: The QA skills hold no references to `llm-wiki` at all, so they write no records
  here. That is now stated, because the `llm-wiki` skill's routing list implies otherwise.
- **Recorded**: `prd-modeling` and `rfc-modeling` both allocate the next free ID from their
  directory, so two branches can pick the same number without a Git conflict — the files differ in
  title. The section says to check the directory against `main` before merging. No tooling
  enforces it; filename-ID uniqueness was scoped out of the linter's first version.
- **Correction**: The `llm-wiki` skill routed implementation-evidence lookups to
  `llm-wiki/implementation/Implementation (MOC).md`, a path that does not exist — the register is
  under `tech/`. Correcting the path alone would have been worse than leaving it: that file is the
  unmaintained placeholder and still reports an empty register while three IMP records exist, so it
  answers wrongly rather than not at all. The skill now routes to `index.md` and says why.
- **Correction**: The same skill routed PRD authoring to `prd-author`, a skill that does not exist.
  It is `prd-modeling`. Its QA entry also implied the QA skills write records here; they hold no
  reference to this directory at all, and the entry now says so.
- **Correction**: The `llm-wiki` skill assumed a record could be asked what backs its claims. Since
  the `Provenance` sections were removed earlier today, CAP, FLOW, INT, and OPS carry no permalink,
  so the skill now points at the IMP records that list them, the deciding ADR, or the code.
- **Maintenance**: The four skills that work on this directory moved into it, from
  `.agents/skills/` to `llm-wiki/.claude/skills/`, and the symlinks under the repository's
  `.claude/skills/` are gone. They are Claude Code only now: nothing else reads that path. Two
  relative links inside them were re-based, and `llm-wiki-steward` refers to them by their
  directory-qualified names.
- **Consequence**: Claude Code loads nested skills lazily. They appear the first time it reads or
  edits a file under `llm-wiki/`, not at session start, and cannot be invoked by name before that.
  For the retrieval skill, whose job is finding something here, that is a chicken-and-egg cost:
  read any file in the directory first, or start the session inside it. Recorded in `Skills`.
- **Update**: `explore` gained a fifth route: crosslinks. OKF expresses relationships as ordinary
  Markdown links, and once a record is open, following its links is cheaper than searching again.
  The skill tabulates which frontmatter field carries which edge, separates those typed edges from
  untyped body links, and states that the graph is directed on purpose: a CAP names the integrations
  it needs and the INT names nothing back, so links answer "what does this rely on?" and never the
  reverse.
- **Maintenance**: `AGENTS.md` was a one-line loader; it now also links all six skills and both
  reference files. The reason is that the skills sit under `.claude/skills/`, which only Claude Code
  reads, while `AGENTS.md` is the entry point for every other agent — and since the operating rules
  moved out of `README.md` into those skills, an agent that cannot load them had no path to the
  rules at all. The links make them readable as plain Markdown. All eight resolve.
  149 lines describing what this directory is rather than how to operate it. The Saleor stamping
  rules became `bookkeeping/references/saleor-schema-notes.md`, where the review-not-restamp point
  is now stated: clearing a `STALE` result means reading the note against the current schema, since
  restamping an unread note turns a known-stale claim into an unknown-stale one. The tooling
  semantics — what the linter checks, why `--silent` is needed for JSON, that the sync keeps rows
  verbatim and appends, that a contract change touches both a template and `_schema.json` — moved
  into the `bookkeeping` skill, as did the rule that `sources/` keeps its body. `README.md` keeps
  one line under `Index and log` naming the two commands, so a reader of that file alone still
  learns the registers are not maintained by hand.
- **Fixed**: removing a section left `README.md` linking `(#saleor-schema-notes)`, and the linter
  passed. Its link rule skipped any target that was empty, so a same-file anchor was never checked —
  the one kind of anchor a section removal always breaks. It now resolves an empty target against
  the file itself, which immediately reported the dead link.
- **Maintenance**: The repository's root instructions now mention this directory, which they never
  did — zero occurrences of "wiki" in `CLAUDE.md`, the file every agent reads first, while a
  92-file knowledge base sat beside the code. Added a `Global rules` bullet, a line in the layer
  tree marking `llm-wiki/` as versioned knowledge rather than code, and a `Knowledge Base` section
  covering what it holds, reading it before deriving the same thing from code, updating
  current-state records in the same change as the behavior, and closing with `pnpm wiki:lint`.
  Root `AGENTS.md` is a symlink to `CLAUDE.md`, so both carry it.
- **Maintenance**: The wiki's tooling moved into the wiki. `scripts/` held nothing but the three
  wiki scripts, so the whole directory became `llm-wiki/_scripts/` — underscored like `_templates/`
  and `_schema.json`, which is how this bundle already marks material that is not a concept. All
  three computed their roots by walking one level up from themselves, so each was re-based: the
  linter now derives `wikiRoot` from its own directory and no longer needs a repo root at all.
  Fourteen `package.json` entries, the `_schema.json` comment, and the direct wrapper invocation in
  the `explore` reference were repointed. Verified from the new location: `wiki:lint`,
  `wiki:index:sync`, `wiki:saleor:hash`, `wiki:saleor:check`, `wiki:qmd:status`, the `--root` flag
  against a throwaway fixture, and the wrapper called directly. The entry above dated 2026-08-04
  still says `scripts/wiki-lint.mjs`, which is where it was then.
- **Maintenance**: The folder tree in `README.md` was missing `_templates/`, the directory that now
  holds every record contract, and gained `_schema.json`, `_scripts/`, `.claude/skills/`, and
  `README.md` itself. It also still described `AGENTS.md` as the file holding the rules.
- **Correction**: Every claim in `explore/references/semantic-search.md` was checked against
  qmd 2.5.3, and three were wrong. `pnpm wiki:qmd:setup` was described as the fix for an index
  pointing at the wrong directory; it is not — it only adds a missing collection and prints
  `already configured` otherwise, so repointing needs `qmd collection remove` first. `--json` was
  documented as the JSON flag; `qmd --help` documents `--format json` and `--json` is an undocumented
  alias. Result paths were described as merely space-normalized; qmd slugifies and drops a leading
  underscore, so `_templates/OPS.md` appears as `templates/OPS.md` and filtering on `_templates`
  matches nothing. Added that unknown flags are silently ignored, which is how a typo'd option looks
  like a working one.
- **Correction**: a fourth claim was overstated. `index.md` and `log.md` were described as matching
  almost everything and crowding a broad result set; measured, they appear at most once in ten hits
  under `query` and not at all under `search` across four probes. What is true is narrower: when a
  sentence handed to `search` matches a single thing, that thing is often `log.md`, because the log
  holds more prose than any record — a symptom of the wrong tool rather than a separate problem.
- **Confirmed**: the claim that a sentence handed to `search` returns nothing — two of three
  sentence-shaped probes returned zero hits, and the question `query` answers with CAP-0002 and
  FLOW-0002 gives `search` none. Also confirmed: `get` accepts a `docid` with its leading `#`, and
  the index path, the install command, and the `query`/`search` split.
- **Index**: The QMD collection pointed at `/Users/lukasz/.codex/worktrees/61df/…`, which is why it
  reported zero files while holding 1012 vectors, as recorded on 2026-08-04. Removed and re-added
  against this checkout, then reindexed and embedded: 92 files, 1231 vectors. Local developer state
  only.
- **Update**: `explore` lost its `The maps of content` and `Answering` sections, leaving three ways
  in plus crosslinks. Two things went with them and are recorded nowhere else: that
  `tech/implementation/Implementation (MOC).md` answers wrongly rather than not at all, and that a
  `tech/saleor/` note needs `pnpm wiki:saleor:check` before it is cited. Both remain true.
- **Recorded**: `index.md` declares `okf_version: "0.1"`, and the published OKF v0.1 field set is
  `type` as the only required field plus optional `title`, `description`, `resource`, `tags`, and
  `timestamp`. This wiki now diverges twice: it forbids `timestamp`, which is standardized, and
  requires `created`, which is not. The reason stands — the removed field disagreed with Git in 27
  of 34 records — but the conformance claim is no longer whole, and nothing in the tree says so.
  Left for a decision: document the departure, or drop the claim.
- **Update**: The qmd instructions moved out of `explore/SKILL.md` into
  `explore/references/semantic-search.md`, following the layout `prd-modeling` and `rfc-modeling`
  already use. The skill keeps a pointer and the reason to read it; the reference holds index
  health, the difference between `query`, `search`, and `get`, and the failure modes that make a
  miss read as an absence.
- **Rewrite**: The `explore` skill is now a guide to the ways into this directory rather than a
  QMD manual: the index, the MOCs per domain, semantic search, plain grep — in the order that
  usually costs least — plus how to answer from what it finds. It states that it is read-only and
  routes every mutation elsewhere. Authoring guidance for Saleor notes moved out of it; only the
  read-side gate stayed, which is running `wiki:saleor:check` before citing one.
- **Maintenance**: The `QMD Retrieval` section left `README.md`. Retrieval is what the skill is
  for, and the wrapper commands were listed in both places. `README.md` now points at the skill
  from the `Skills` table.
- **Fixed**: `wiki:lint` reported that link as unresolved. The rule only accepted a target outside
  the linted set when it was not Markdown, so a link to a skill under `.claude/` failed even
  though the file is there. It now accepts any target that exists on disk and skips only the
  anchor check. Verified that a genuinely missing target still fails.
- **Maintenance**: `grilling` and `handoff` moved in as well, because `prd-modeling` invokes both
  — as its business-grilling stage and to close a session. Their invocations now use the
  directory-qualified names. Neither is wiki-specific, so lazy loading costs more here than
  elsewhere: after a session that never touched this directory, `/llm-wiki:handoff` does not
  exist, which is exactly when a handoff is wanted. Recorded in `Skills`.
- **Rename**: `llm-wiki` → `explore` and `llm-wiki-bookkeeping` → `bookkeeping`. The directory
  qualifier already says which wiki they serve, so the old names stuttered: `llm-wiki:llm-wiki`.
  Updated in both skills' `name`, the cross-reference from `explore`, the `Skills` table, the QMD
  rule that names the audit, and `llm-wiki-steward`'s `skills` list. Entries above this one keep
  the old names because they describe what was true when written.
- **Correction**: `llm-wiki-bookkeeping` told an agent to treat `AGENTS.md` as the single source of
  truth for record frontmatter and templates. That stopped being sufficient when the contracts
  moved into the templates and `_schema.json`: reading only `AGENTS.md` now yields a table of links
  and no rules. The skill now states that the governing instructions are the set `AGENTS.md` names.
- **Repair**: `pnpm wiki:lint` reported 8 violations left by the `AGENTS.md` → `README.md`
  restructure, and this is the first time the linter found anything nobody had noticed. OPS-0002
  began with `/---` instead of `---`, one stray character that disabled its whole frontmatter.
  `index.md` and `README.md` linked `_templates/PRD.md` while the file on disk is `prd.md`, which
  resolves on macOS and fails on Linux. `AGENTS.md` is now a loader with no frontmatter, and
  `README.md` was registered nowhere. The schema gained an `except` for the loader and `README.md`
  in the `Root` register scope; the links were pointed at the name on disk. Back to 0 violations.

## 2026-08-07

- **Update**: Recorded in CAP-0003 that checkout step selection is enforced against completeness on
  every request rather than only on entry, covering direct-URL and unknown step values, the
  unreachable shipping steps on a checkout that requires no shipping, and the deliberate
  reachability of already-answered steps. The existing behavior text already claimed
  first-incomplete step selection; before this change the guard ran only when the step query
  parameter was absent, so a step reached by URL bypassed it and opened a gateway transaction for a
  checkout that could not be ordered. Tracked as NIM-51.
- **Create**: Added IMP-0004 for that work at `in_progress`, with its work item and pull request
  both [PR 757](https://github.com/mirumee/nimara-ecommerce/pull/757) on unmerged branch
  `fix/checkout-steps-guards`. It stays below `implemented` because the nine end-to-end tests it
  ships have not been observed passing against the change: they were exercised against deployed
  `main`, which lacks the fix, where they reproduced the defect. Confirming them needs a preview
  deployment, because the commerce backend the local storefront environment points at carries
  neither end-to-end fixture product.
- **Gap**: The orphaned-PaymentIntent concern in NIM-51 is narrowed, not closed. A complete checkout
  still opens a fresh intent on every mount and remount of the payment element. Recorded as a
  deviation in IMP-0004; no separate work item exists for it.

## 2026-08-18

- **Create**: Added ADR-0003 at `accepted`, making CodeceptJS the only end-to-end engine and
  removing the Playwright test runner from `apps/automated-tests`. The `playwright` package stays,
  pinned to an exact `1.59.1`, because `helpers.Playwright` in `codecept.conf.ts` is what drives
  the browser. `docs/adr/0001-codeceptjs-spike.md` is now `superseded`: it set a
  migrate-or-delete date of 2026-08-13 and named an undecided outcome as the one it refused, so
  this closes it five days late. ADR-0003 also records that the dependency cost ADR 0001
  justified as temporary — the Vercel AI SDK, an MCP server SDK, a beta package, and the Gherkin
  stack, 84 packages against 2 removed — is now permanent.
- **Update**: Corrected five quality notes that described the deleted Playwright suite as current.
  Coverage Maps now maps the eight CodeceptJS scenarios, states chromium-only with no retries,
  and carries an explicit accepted-coverage-loss paragraph. Test Method Playbooks, Known Flaky,
  Bug Retest & Triage Process, and Test Data & Fixtures now describe the real artifact surface: one
  screenshot per failed scenario in `output/`, no trace, no video, no HTML report, and wait
  timeouts in seconds rather than milliseconds.
- **Update**: Amended IMP-0004 rather than rewriting it. Its `verification` entries still name
  `checkout-step-guard.spec.ts`, which was deleted, and are left as the historical record of what
  verified the change when it shipped. The amendment says so and states the consequence plainly.
  The record stays `in_progress`, because deleting the spec removed the route to `implemented`
  instead of satisfying it.
- **Gap**: The second IMP-0004 criterion — the payment section does not render on a checkout that
  cannot be ordered — now has no automated coverage at any level. It was the only criterion whose
  sole evidence was the deleted browser spec, and it is the behavior whose absence opened gateway
  transactions for checkouts that could not be ordered. The category page, the checkout step
  guard, and the authenticated checkout are likewise unexercised, and cross-browser coverage is
  gone. No work item exists for re-authoring any of it.

## 2026-08-19

- **Update**: OPS-0002 named `NEXT_PUBLIC_ENVIRONMENT`, which the payment application stopped
  reading when it moved off Next.js. The setting is `ENVIRONMENT`, is required, and has no default.
  An operator following the old runbook set a variable nothing reads and the application refused to
  start. Recorded with the consequence the old text never carried: the value prefixes both the
  advertised application ID and the hosted-store key, so changing it on a running deployment offers
  Saleor a different application and reads a different tenant map, and every existing installation
  reads as absent while the application otherwise serves normally.
- **Update**: Added the payment application's build and deploy surface to OPS-0002's preconditions,
  none of which existed while it was a Next.js application. `BUILD_TARGET` selects the output
  layout, accepts only `node` or `vercel`, and has no default, so an unset value fails the build at
  its first step and refuses the development server the same way; it is a declared Turbo build
  input. The Vercel project builds through the application's own `vercel.json` under the Hono
  framework preset, which resolves its entrypoint by finding a file that imports Hono. `BASE_PATH`
  is baked into the manifest's registration, application, and webhook addresses, which Saleor
  records at installation, so changing it afterwards strands an installation. `SENTRY_DSN` replaced
  `NEXT_PUBLIC_SENTRY_DSN`; OPS-0002 had never named either, so this is an addition rather than a
  rename.
- **Update**: Two failure modes added to OPS-0002's escalation. A build stopping at its first step
  naming `BUILD_TARGET`, or a Vercel build reporting that no entrypoint imports Hono, are build
  configuration rather than application faults.
- **Gap**: Found while writing the above and recorded in OPS-0002's escalation rather than fixed:
  the Stripe endpoint address is built from the request origin alone and does not carry
  `BASE_PATH`, while the manifest's Saleor-facing addresses do. A deployment served under a path
  prefix therefore registers a Stripe endpoint that omits the prefix and answers 404, with
  installation and channel configuration both reporting success. No work item exists for it.
- **Confirmed**: OPS-0002's `NEXT_PUBLIC_SALEOR_API_URL` precondition is still correct and was left
  alone. The variable no longer appears in the application's example environment, but code
  generation still reads it, which is exactly what that bullet claims.
- **Repair**: Re-pointed the `verification` test paths in IMP-0001 and IMP-0002, all five of which
  named files the move off Next.js deleted. The template tells an author not to restate changed
  files because a path list rots while the pull request stays accurate, and that reasoning holds for
  prose. It does not hold here: `verification.tests` is a structured pointer to the evidence for a
  criterion, so a dead entry makes the criterion unverifiable rather than merely out of date. Both
  records remain `in_progress`; criteria, work items, pull requests, and statuses were not touched.
- **Repair**: Each successor was read against the criterion before it was cited, and two of the
  proposed mappings did not survive that check. IMP-0001's redisplay-consent criterion was to gain a
  second file covering expandable identifiers and setup-intent status mapping, which verifies
  nothing the criterion claims; it was dropped and the criterion cites only the serializer tests,
  which assert both of its halves. IMP-0001's gateway-customer criterion needed the opposite
  treatment: the proposed file proves the mapping is scoped to channel and account but says nothing
  about reach between shoppers, so the transaction webhook tests were added alongside it for
  refusing a saved method that belongs to another customer.
- **Gap**: IMP-0002's second criterion was left pointing at a deleted file on purpose. An empty
  allowlist still refuses every domain and the shared package asserts it, but the refusal that names
  the setting to change is now built in the installation route and nothing asserts it; the deleted
  test had asserted both halves in one expectation. Citing the surviving half would claim coverage
  the record does not have, so the entry stays dead and the reason is recorded as a deviation on the
  record itself. Closing it needs a test, which is code work and outside this change.
- **Gap**: IMP-0001's gateway-customer criterion is cited honestly but has narrowed. The deleted
  tests asserted that a mapping planted in shopper-writable public metadata is never resolved — the
  property that record's summary calls load-bearing and INT-0005 states as contract. The successor
  reads private metadata only, so the property now holds by construction rather than by assertion.
  No criterion names it, so no path was changed for it. No work item exists.
- **Closed**: The `BASE_PATH` gap recorded above is fixed in code, so OPS-0002 no longer states it
  as current behaviour. Every address the application hands out is now derived from one
  prefix-carrying value, the endpoint registered with Stripe included, so the manifest and the
  provider endpoint cannot disagree again. The escalation bullet was kept rather than deleted and
  rewritten as the symptom an operator still meets on a deployment installed by an older release:
  a Stripe endpoint that omits the prefix and answers 404 while Saleor looks healthy. Verified that
  saving the channel configuration once replaces such an endpoint, because cleanup matches on the
  application, environment, and Saleor domain rather than on the address.
- **Update**: Recorded in OPS-0002 that `BASE_PATH` is now validated as the configuration loads. A
  bare `/`, a trailing slash, a missing leading slash, and an empty leading segment are each
  refused with a message naming the shape to use, so an operator learns the format from the runbook
  or from a refused startup rather than from addresses that never answer. The precondition also now
  names the Stripe endpoint among the addresses the prefix reaches, which it did not before.
- **Correction**: ADR-0002's decision prose named `createSaleorAppConfigProvider` and a `read` and
  `write` pair. Neither survives: the seam is `ConfigItemRepository` in the shared infrastructure
  package, satisfied by `get` and `upsert`, and the backend is chosen where the application wires
  its dependencies rather than inside the provider. The decision itself is unchanged — storage is
  still a replaceable transport behind one seam, still selected by `CONFIG_PROVIDER`, still
  defaulting to `edge` — so this is a prose repair and the record stays `proposed` with no
  supersession. The commit-anchored file list at the end was left alone, because it resolves an
  exact SHA at which those paths were correct.
- **Update**: Re-pointed two stale stripe paths in `Test Method Playbooks`. The colocated-unit-test
  list named `apps/stripe/src/lib`, which still holds tests but no longer holds the serializers,
  use cases, or route handlers the sentence describes; it now names `apps/stripe/src`. The
  API-contract playbook named the same directory for webhook route examples, which moved to
  `apps/stripe/src/apps/handler/api/rest`. Added `packages/infrastructure/src` to the first list as
  well: the same rewrite gave that package its own suite, including the allowlist tests IMP-0002
  now cites.
- **Decided**: Left `Product Overview`'s permalinks alone, including the one naming a payment
  application directory that no longer exists. The record declares the commit it describes, carries
  a `Provenance` section, and routes current contracts to the narrower records, so a pinned SHA is
  correct there precisely because it is immutable. Re-pointing it at today's tree would contradict
  the record's own anchor, and annotating each drifted link would turn a snapshot into a changelog.
  What the record needs instead is a deliberate re-anchor to a newer commit, which is an editorial
  act rather than a link repair.
- **Gap**: IMP-0003's implementation summary still names `createSaleorAppConfigProvider`. Left as
  written: that record is anchored to the commit where the symbol existed, which is the same
  reasoning that keeps ADR-0002's file list intact. Whoever re-anchors it should expect the name to
  change.
- **Closed**: The deliberately dead pointer on IMP-0002's second criterion is re-pointed at
  `apps/stripe/src/apps/handler/api/rest/saleor/register.test.ts`, which now covers both halves of
  the criterion as written. Read before citing: the file drives the real installation route with
  only the container mocked, and the harness installs the real error handler, so the refusal text
  it asserts is the one the route builds rather than a fixture. An unconfigured allowlist refuses
  with the installation never attempted, and a separate case asserts the refusal names
  `ALLOWED_DOMAINS`. A third case is what makes the second meaningful without a mutation run: a
  configured allowlist that merely excludes the domain names the domain and _not_ the setting, so
  the string cannot be incidentally present in every response. The deviation explaining the dead
  pointer was replaced, because it no longer described reality; what remains records that every
  path here was re-pointed after the framework move and why each replacement was accepted.
- **Closed**: The public-metadata regression on IMP-0001's gateway-customer criterion is covered
  again, by two cases added to the file the criterion already cites — a mapping planted in
  shopper-writable public metadata does not resolve, and it cannot override the private mapping.
  No path changed and no record was edited, so this is a log closure only. The property the record's
  summary calls load-bearing, and INT-0005 states as contract, is asserted rather than structural
  again.
- **Verified**: Both cited files pass in isolation and the application suite is green at 17 files
  and 151 tests, which includes concurrent edits to the webhook validation middleware and its test
  that were in the working tree during this change. Confirmed those edits leave IMP-0002's third
  criterion intact: the case asserting rejection ahead of the installation lookup and the signature
  check is unchanged, and the test added beside it covers body encoding, which no criterion claims.
- **Held**: IMP-0002 stays `in_progress` although all three criteria now cite live tests. Its own
  evidence section gives a reason unrelated to test paths — isolation across two live installations
  on one deployment has never been exercised, and neither has its rollback. Promoting it is an
  engineering judgement about deployed verification, not bookkeeping.
- **Update**: CAP-0007 now records that adding a payment method collects it in an element scoped to
  the channel's currency, with a constraint stating why: a tokenization session carries no currency
  of its own, so without being told one the provider offers every method it can store, including
  ones the channel cannot charge. The mismatch was previously invisible until a payment with such a
  method was refused.
- **Update**: CAP-0007 gained a constraint on the return leg of a redirecting method. It arrives as
  a cross-site top-level navigation, so a strictly same-site authentication cookie is withheld on
  it; the shopper reads as signed out and lands on sign-in with the tokenization never completed,
  although the provider authorised it. The record already covered clearing unusable credentials,
  which is a different failure and stays as written.
- **Update**: CAP-0003 now states that the stored-method list at the payment step covers every
  method type the payment application returns — a type with a dedicated presentation shows its own
  details, any other is offered under its provider label rather than being dropped.
- **Decided**: Two findings from the same session were left unrecorded on the owner's call. Two
  live installations against one commerce instance duplicating a wallet is a development-environment
  artifact rather than product truth, and the absence of a currency filter on the stored-method list
  is an open defect, which is tracked as work rather than described as current behaviour.

## 2026-08-20

- **Update**: Recorded the payment application's shared gateway configuration in INT-0005. One key
  pair now serves the installation, entered on a default channel the operator chooses; a channel
  resolves to its own override or to that shared configuration, and an override replaces the whole
  key pair so no channel mixes keys from two provider accounts.
- **Update**: INT-0005 also states that a save reconciles webhook endpoints against the secret keys
  in use — an endpoint survives while its key is configured, an added key gets one, a dropped key
  loses one — replacing the previous remove-then-recreate description, and that the configuration
  screen receives both secrets masked.
- **Update**: Reworked OPS-0002 for the same model: the operator picks the default channel in the
  configuration screen, keys are entered once on it, rotation of the shared keys moves every
  inheriting channel at once, and a blank secret field on save keeps the stored key.
- **Update**: Corrected the stored-record description in ADR-0002 and its restatements in IMP-0002
  and IMP-0003. The decision itself — that the configuration backend is selectable — is unchanged;
  only the shape of the value it stores and the name of the rule that reads it were stale.
- **Update**: INT-0005 records what a save does for a commerce domain with no entry. A deployed
  application refuses it, because the configuration screen is only reachable from an installed
  application; a development build creates the entry so the screen can be worked on standalone, and
  a later installation fills in the token and application ID on the same entry. ADR-0002's summary
  of the tenant rules was corrected to match: the update path creates or rejects.
- **Update**: INT-0005 and OPS-0002 now record that each installation chooses and stores its own
  default channel. A deployment-wide channel name would have left any installation not sharing that
  slug convention unable to save keys at all, including on first setup, so the choice belongs to the
  installation rather than to the deployment.

## 2026-08-21

- **Update**: Restated what `BUILD_TARGET` selects in OPS-0002. It no longer picks between output
  layouts — both write the same directory — but between ways the client bundle reaches the browser,
  after the Vercel deployment served its configuration screen with a failed request for that bundle.
  Vercel serves from its CDN only files that exist before the build command runs, and places in the
  function only what it can trace through imports, so a bundle written by the build reaches the
  browser by neither route; under `vercel` the build now carries the assets inside the server bundle
  and the application serves them, while `node` leaves them as files for S3 and CloudFront. A blank
  configuration screen whose bundle request fails was added as the first sign of a deployment built
  under the wrong target.
