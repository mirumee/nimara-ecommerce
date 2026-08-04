---
type: "Architecture Decision Record"
title: "Payment Application Configuration Storage Is Selectable"
description: "The payment application selects where it stores the configuration of every installed commerce instance: a hosted store for deployments, or an on-disk file for a developer machine."
tags:
  - "adr"
  - "payments"
  - "stripe"
  - "saleor-app"
  - "configuration"
  - "developer-experience"
created: "2026-08-04T00:00:00+00:00"
timestamp: "2026-08-04T00:00:00+00:00"
status: "proposed"
owner: "engineering"
superseded_by: null
---

## Context

The payment application persists one record per installed commerce instance: the installation
token, the application ID, and the per-channel provider keys, webhook IDs, and webhook signing
secrets. Until this decision that record had exactly one home, Vercel Edge Config, reached over the
Vercel REST API with an access token, a team identifier, and a database identifier. All three were
required configuration, so the application could not start without them, and the stored-value
access rules lived inside the Edge Config provider itself.

That coupling has two costs.

The first is that a developer cannot run the application without membership of a Vercel team that
holds an Edge Config. The failure is late and opaque: the manifest is served, the commerce instance
completes its half of the installation and posts a valid installation token, and the write of that
token is what fails. The API answers `403 Forbidden`, registration answers 400, and the commerce
instance records a failed installation, leaving an application that is installed on one side and
unconfigured on the other. Nothing before that point signals a configuration problem. This
repository is open source, so the set of people who cannot run the application includes every
outside contributor.

Sharing one team's store between developers is not a substitute. The stored value is a map keyed by
commerce domain, so developers pointing at different commerce instances do coexist in it. Developers
pointing at the _same_ instance do not: an installation rewrites that domain's entry, including its
installation token and its webhook IDs and signing secrets, so the second installation silently
takes payments away from the first.

The second cost is that the tenant rules — locate by domain or application ID, merge per-channel
configuration on update, reject a missing tenant or channel — were written inside the Edge Config
provider. Any second storage backend would have had to restate them, and two copies of a merge rule
that decides whether one installation can read another's credentials is a poor place for drift.

## Decision

We will treat storage as a replaceable transport behind one seam, and select it by configuration.

A store is the pair `read` and `write` over the whole tenant map.
`createSaleorAppConfigProvider` holds every tenant rule and calls that pair; a backend supplies
transport only. The Edge Config backend keeps the Vercel REST calls and nothing else.

`CONFIG_PROVIDER` selects the backend and defaults to `edge`, so a deployment that says nothing
behaves exactly as before. `CONFIG_FILE_PATH` names the file for the `file` backend and defaults to
`.saleor-app-config.json`, relative to the application.

The Vercel access, team, and database values become optional and are validated only when `edge` is
selected. When one is missing, configuration validation fails at startup with a message that names
the variable and names `CONFIG_PROVIDER=file` as the alternative, instead of surfacing as a rejected
write at the end of an installation.

The `file` backend is for developer machines. It creates its file readable by the owner only, and
the file is ignored by Git. We will not add a runtime guard that refuses `file` on a deployment; the
constraint is carried by documentation and by the runbook.

## Consequences

Easier or safer:

- A developer, including an outside contributor, installs and runs the application with no Vercel
  account, no access request, and no state shared with anyone else. The shipped example
  configuration is sufficient on its own.
- A misconfigured hosted store now fails at startup, naming the missing variable, rather than as a
  403 on the last step of an installation that the commerce instance then records as failed.
- Tenant isolation and the per-channel merge exist once. A future backend — a database, a secret
  manager — supplies two functions and inherits the rules rather than restating them.

Harder or lost:

- The file holds installation tokens and provider secret keys as readable text on a developer's
  disk. Owner-only permissions are applied when the file is created, so a file that already exists
  keeps whatever permissions it has.
- Selecting `file` on a deployment loses configuration rather than failing loudly: a serverless
  filesystem is per-instance and does not survive, so installations would appear to succeed and
  then vanish. Nothing in the code prevents that selection.
- Two storage paths now exist and only the hosted one is exercised by any deployment. Neither the
  shared core nor either backend carries a unit test at the time of this decision, so the merge
  rules that were moved are covered by review alone.
- The two new settings had to be declared as build inputs in the application's Turbo task,
  otherwise a cached build produced under one selection could be served for the other.

Neutral, and relevant to whoever revisits this:

- Every mutation still reads the whole tenant map, changes one entry, and writes the map back, so
  concurrent saves across installations remain last-write-wins. That property moved unchanged into
  the shared core and is stated there; this decision neither introduces nor removes it.
- The selection is a plain enumeration in the runtime configuration schema, not a registry. A third
  backend costs one enumeration member and one branch.
- Nothing about the commerce or provider contracts changes. An installation cannot observe which
  backend served it.

Implemented on branch `NIM-56-stripe-app-file-config-provider` in commit
`2680feabd8fc0cc5efdd680a2d78fed778c6ed8b`, touching `apps/stripe/src/config.ts`,
`apps/stripe/src/providers/config.ts`, `apps/stripe/src/lib/saleor/config/store.ts`,
`apps/stripe/src/lib/saleor/config/file.ts`, `apps/stripe/src/lib/saleor/config/edge.ts`, and
`apps/stripe/turbo.json`. Tracked as NIM-56. No automated test covers the change.

## Related Notes

[ADR MOC](ADR%20MOC.md)
[IMP-0003 Payment Application Configuration Storage Selection](../implementation/IMP-0003%20Payment%20Application%20Configuration%20Storage%20Selection.md)
[INT-0005 Stripe Payment Application](../../product/integrations/INT-0005%20Stripe%20Payment%20Application.md)
[OPS-0002 Stripe Payment Application Installation and Key Rotation](../../operations/OPS-0002%20Stripe%20Payment%20Application%20Installation%20and%20Key%20Rotation.md)
