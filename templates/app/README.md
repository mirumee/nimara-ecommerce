# app-template

A Saleor app: Hono on the server, React in the Saleor dashboard. Generated apps
start as a copy of this one, so what is here is what every app begins with.

Generate one instead of copying by hand:

```bash
pnpm gen app
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
  entry-queue.ts           a queue service instead; exports `handler` alone
  entry-client.tsx         the dashboard bundle Saleor loads
  config.ts                this service's environment
  container.ts             the app container, built from that config
  api/rest/saleor/         manifest, register, webhooks
  api/rest/app/            what the dashboard calls
  client/views/            the dashboard itself
src/container/             wiring; everything is lazy
src/domain/                what the app stores per installed Saleor
src/infrastructure/        outward calls
src/graphql/               documents, and the client generated from them
```

`src/services/*` is scanned by the build and by the dev server, so adding a
directory with an entry file is all it takes to add a service. A single HTTP
service is served at `/`, several under `/<service>`. A service holds one entry
file or the other, never both: one service is one deployed unit. Both generators
ask what to call it.

## Adding a service

```bash
pnpm gen service
```

It copies this template's service under the name you give, points the imports
that reached into the old one at the new one, and takes the tenancy from the
services already there — they share one `.env`, so they cannot disagree. It
asks what the service serves — a dashboard, HTTP alone, or a queue — so one app
can hold several kinds side by side. A queue service is offered only where the
app's build target can drive one.

## Queue services

A deployment drives a queue service from an SQS event source mapping. In
development the dev server stands in for that mapping, so what runs locally is
the deployed code path.

Start LocalStack from the repository root:

```bash
docker compose up -d localstack
```

The dev server reads `<SERVICE>_QUEUE_URL` — `CONSUMER_QUEUE_URL` for a service
named `consumer` — and creates that queue on LocalStack before it polls. Name a
queue in `SQS_QUEUES` when it has to exist before anything reads it, such as one
another app publishes to:

```bash
SQS_QUEUES=feed-sync-consumer docker compose up -d localstack
```

The AWS variables sit in the service's own `.env.example`. `AWS_ENDPOINT_URL` is
what points the client at LocalStack, and what lets the dev server create a
queue at all — against a real account it creates nothing, because a typo in a
queue URL would silently make a queue rather than fail.

Building a queue service for Vercel fails: nothing there polls a queue, so it
would build and never run. Use `BUILD_TARGET=node`.

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

## The dashboard

Saleor opens the app's root in an iframe, announced as `appUrl` in the
manifest. `dashboard.ts` is mounted there and answers first. Below it sits a
plain text route, which is what answers once an app drops its dashboard — so
the manifest says the same thing either way.

The page talks to `/api/app`, which verifies the staff user's token and
requires `MANAGE_APPS`. The tenant comes from that token, never from the
request body.

A secret is masked on the way out and blank on the way back in. The form sends
a blank field to mean "keep the stored value", so a mask can never be saved
over a real key. `SECRET_FIELDS` decides which fields that applies to.

Answer `http` when generating and none of it is copied. Both generators ask, so
a service added later can differ from the one the app started with, and adding
a dashboard to an app without one brings back what its bundle needs.
