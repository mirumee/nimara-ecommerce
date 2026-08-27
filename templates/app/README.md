# app-template

A Saleor app: Hono on the server, no dashboard. Generated apps start as a copy
of this one, so what is here is what every app begins with.

Generate one instead of copying by hand:

```bash
pnpm gen saleor-app
```

## Running it

```bash
pnpm env:init   # composes .env from this app's .env.example and each service's
pnpm dev
```

`env:init` refuses to overwrite an existing `.env`.

Set at least `ENVIRONMENT` and `ALLOWED_DOMAINS` — an empty allow list admits
no Saleor at all, which is the safe default but installs nothing.

A single-tenant app names one concrete domain there and reads it back as
`SALEOR_DOMAIN`, for work that arrives with no request. A multi-tenant one has
no such field: it takes the tenant from whichever middleware verified the
caller.

## Layout

```
src/services/<service>/    one service, one entry point, one Lambda
  entry-server.ts          the Hono app; `handler` is its Lambda binding
  config.ts                this service's environment
  api/rest/saleor/         manifest, register, webhooks
src/container/             wiring; everything is lazy
src/domain/                what the app stores per installed Saleor
src/infrastructure/        outward calls
src/graphql/               documents, and the client generated from them
```

`src/services/*` is scanned by the build and by the dev server, so adding a
directory with an `entry-server.ts` is all it takes to add a service. A single
service is served at `/`, several under `/<service>`.

## Adding a service

```bash
pnpm gen saleor-service
```

It copies this template's service under the name you give, points the imports
that reached into the old one at the new one, and takes the tenancy from the
services already there — they share one `.env`, so they cannot disagree.

## Adding a webhook

Write the subscription document under `src/graphql/subscriptions/`, run
`pnpm codegen`, then add an entry to the registry in
`src/services/<service>/api/rest/saleor/index.ts`. The manifest is built from
that registry, so a webhook cannot be announced to Saleor without a route
answering it.

Handlers receive the verified tenant as an argument. Scope every read and write
by it, never by a value from the payload — see `product-updated.ts`.

## Configuration

Each installed Saleor gets its own entry, keyed by domain. `src/domain/app-config.ts`
declares what this app stores beside the install record; `SECRET_FIELDS` names
the ones a dashboard must never show in full.
