# app-template

Hono on the server. Generated apps start as a copy of this one, so what is
here is what every app begins with.

Generate one instead of copying by hand:

```bash
pnpm gen app
```

## Running it

```bash
pnpm env:init   # copies .env.example to .env
pnpm dev
```

`env:init` refuses to overwrite an existing `.env`.

Set at least `ENVIRONMENT`.

## Layout

```
src/services/<service>/    one service, one entry point, one Lambda
  entry-server.ts          the Hono app; `handler` is its Lambda binding
  entry-queue.ts           a queue service instead; exports `handler` alone
  entry-event.ts           an invoked service instead; exports `handler` alone
  config.ts                this service's environment
  container.ts             the app container, built from that config
src/container/             wiring; everything is lazy
src/infrastructure/        outward calls
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

It copies this template's service under the name you give and points the
imports that reached into the old one at the new one. It asks what the
service serves — HTTP, a queue, or a direct invoke — so one app can hold
several kinds side by side. A queue or an invoked service is offered only
where the app's build target can drive one.

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

The AWS variables arrive in `.env.example` with the service. `AWS_ENDPOINT_URL`
is what points the client at LocalStack, and what lets the dev server create a
queue at all — against a real account it creates nothing, because a typo in a
queue URL would silently make a queue rather than fail.

Building a queue service for Vercel fails: nothing there polls a queue, so it
would build and never run. Use `BUILD_TARGET=node`.

## Event services

An invoked service is driven by whatever calls it directly — a scheduled
rule, another function, or a hand-run invoke — never by a request. `handler`
takes the event and an invocation context whose `getRemainingTimeInMillis`
gives the work its budget, so a long job checkpoints and invokes itself again
rather than running until Lambda kills it.

In development the dev server stands in for that trigger at
`POST /<service>/invoke`, with a 60-second budget. Building an event service
for Vercel fails the same way a queue service does: nothing there invokes a
function directly. Use `BUILD_TARGET=node`.
