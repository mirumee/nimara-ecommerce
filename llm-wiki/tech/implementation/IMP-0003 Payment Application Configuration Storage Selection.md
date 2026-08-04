---
type: "Implementation Record"
title: "Payment Application Configuration Storage Selection"
description: "Splits the payment application's configuration provider into a storage-agnostic core and selectable backends, adding an on-disk store so the application installs and runs without a hosted configuration service."
tags:
  - "implementation"
  - "payments"
  - "stripe"
  - "saleor-app"
  - "configuration"
  - "developer-experience"
created: "2026-08-04T00:00:00+00:00"
timestamp: "2026-08-04T00:00:00+00:00"
status: "in_progress"
owner: "engineering"
work_item:
  id: "2680feabd8fc0cc5efdd680a2d78fed778c6ed8b"
  url: null
relations:
  prds: []
  rfcs: []
  adrs:
    - "[Payment Application Configuration Storage Is Selectable](../ADR/ADR-0002%20Payment%20Application%20Configuration%20Storage%20Is%20Selectable.md)"
  product_records:
    - "[Stripe Payment Application](../../product/integrations/INT-0005%20Stripe%20Payment%20Application.md)"
    - "[Stripe Payment Application Installation and Key Rotation](../../operations/OPS-0002%20Stripe%20Payment%20Application%20Installation%20and%20Key%20Rotation.md)"
  rolled_back_by: null
pull_requests: []
verification:
  - criterion: "A developer with no access to the hosted configuration service can start the application, install it into a commerce instance, save per-channel provider keys, and take a payment through it."
    tests: []
  - criterion: "With the hosted store selected and one of its three required values missing, configuration validation fails at startup with a message naming the variable and the on-disk alternative."
    tests: []
  - criterion: "Selecting either backend needs no code change, and a deployment that sets nothing keeps using the hosted store."
    tests: []
  - criterion: "Tenant isolation and the per-channel merge behave identically on both backends."
    tests: []
rollout: "No action is required for an existing deployment. `CONFIG_PROVIDER` defaults to `edge`, so a deployment that sets nothing keeps reading and writing the hosted store with the values it already has. The two new settings are declared as build inputs in the application's Turbo task, so a build produced under one selection is not reused for the other. Developers switch by setting `CONFIG_PROVIDER=file` and may then leave the Vercel access, team, and database values unset."
rollback: "Restore the previous deployment. The stored value's shape is unchanged, so a release predating this change reads and writes the same hosted map with no migration. A deployment that had been switched to the on-disk backend is the exception: its configuration lives on an ephemeral per-instance filesystem, is not readable by the restored release, and the affected installations must be reinstalled and reconfigured. See [Stripe Payment Application Installation and Key Rotation](../../operations/OPS-0002%20Stripe%20Payment%20Application%20Installation%20and%20Key%20Rotation.md)."
---

# Implementation summary

The configuration provider is now two parts. `createSaleorAppConfigProvider` holds every tenant
rule — lookup by commerce domain or application ID, the per-channel merge on update, and the missing
tenant and missing channel failures — and reaches storage through one pair of functions that read
and write the whole tenant map. A backend supplies that pair and nothing else. The Edge Config
backend was reduced to its two Vercel REST calls; the rules it previously carried moved to the core
unchanged.

A second backend keeps the same map in a JSON file. It treats a missing or empty file as an empty
map, so a first installation needs no setup step, and it creates the file readable by its owner only
because the contents are installation tokens and provider secret keys. The file is ignored by Git.

`CONFIG_PROVIDER` selects the backend and defaults to `edge`. The Vercel access, team, and database
values became optional in the runtime schema and are required only when `edge` is selected; the
failure names the missing variable and names the on-disk alternative. Before this change all three
were unconditionally required, so the application could not start without a Vercel account at all,
and the account was needed a second time at installation, where writing the installation token was
what actually failed.

Both new settings were added to the application's Turbo build inputs. Without that, a cached build
produced under one selection could be served for the other, and the repository's lint rule for
undeclared environment variables fails the build.

# Deviations

- No PRD or RFC precedes this work. The decision and its trade-offs are recorded in
  [ADR-0002](../ADR/ADR-0002%20Payment%20Application%20Configuration%20Storage%20Is%20Selectable.md),
  filed with this record and still `proposed`.
- Neither the shared core nor either backend carries a unit test. The tenant rules that decide
  whether one installation can read another's credentials were moved between files with no test
  asserting they still hold, and are covered by review only. This is why the record is
  `in_progress`: the schema requires a test path against an acceptance criterion before
  `implemented`, and every criterion above lists none.
- Nothing prevents selecting the on-disk backend on a deployment, where a per-instance ephemeral
  filesystem makes installations appear to succeed and then disappear. The constraint is carried by
  the runbook, the example configuration, and a comment at the backend, not by code.
- Owner-only permissions are applied when the file is created. A file that already exists keeps
  whatever permissions it has, so a file created by an earlier run of unrelated code would not be
  tightened.
- The whole-map read-modify-write, and the last-write-wins property it produces for concurrent saves
  across installations, moved into the shared core unchanged. No locking was added and none was
  attempted.
- No pull request exists yet, so the work item is anchored to the branch commit. The record must be
  re-anchored on the squash-merge commit, and its pull-request list filled, once the change lands.

# Verification evidence

At the anchored commit the application suite is 175 passing across 16 files, with `tsc --noEmit`
clean and the repository lint clean including the undeclared-environment-variable rule that the two
new settings had to satisfy. None of those 175 tests exercise the changed code: they were passing
before the change and cover unrelated modules.

The acceptance criteria are therefore unverified as automated checks. The end-to-end criterion — a
developer with no hosted-store access installing the application and taking a payment — was the
motivating failure and has been reproduced as a failure against the previous code, where the write
of the installation token is rejected with `403 Forbidden` and registration answers 400. Confirmation
that the on-disk backend carries the same flow through to a payment has not been recorded here.

Behavioural equivalence between the two backends rests on both calling the same core. That is a
structural argument, not a test result: no test runs the core against either backend.

# Related Notes

[ADR-0002 Payment Application Configuration Storage Is Selectable](../ADR/ADR-0002%20Payment%20Application%20Configuration%20Storage%20Is%20Selectable.md)
[Stripe Payment Application](../../product/integrations/INT-0005%20Stripe%20Payment%20Application.md)
[Stripe Payment Application Installation and Key Rotation](../../operations/OPS-0002%20Stripe%20Payment%20Application%20Installation%20and%20Key%20Rotation.md)
[IMP-0002 Stripe Payment Application Multi-Tenancy](IMP-0002%20Stripe%20Payment%20Application%20Multi-Tenancy.md)
