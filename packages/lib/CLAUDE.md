# Lib

This package owns the shared runtime for Hono-based Saleor apps in `apps/*`: the HTTP
error hierarchy, response envelope, middleware, env/config parsing, the Saleor app kit
(manifest, register, webhook registry), and the Dashboard UI shell. The build
machinery is `@nimara/tooling`.

- Everything here must stay app-agnostic. A name, string, or schema field that only one
  app could want belongs in that app, not here.
- Depends on `@nimara/domain`, `@nimara/foundation`, `@nimara/infrastructure`, and
  `@nimara/ui` only. Provider code (jose, Saleor client, config storage) lives in
  `@nimara/infrastructure`; general-purpose helpers with no Hono or Saleor content
  belong in `@nimara/foundation`; this package wires them into Hono.
- Nothing build-time belongs here. This package is bundled into every app that uses
  it, so a `vite` import would put vite and its plugins in the graph of every
  consumer — `@nimara/tooling` exists for that, and Node loads it before any of this
  package resolves.
- Anything that names Hono — a `Context`, a `MiddlewareHandler`, an `HTTPException` —
  lives under `src/hono/**`. What is left outside it (the response envelope schema,
  the error base classes, the Saleor URL and domain helpers) is what another runtime
  could reuse unchanged, and it must stay that way.
- A file under `src/hono/middleware/` is not named `*-middleware`; the directory
  already says it. The exported factory keeps the suffix, because the call site does
  not.
- Two middlewares publish the tenant and nothing else may: `saleorTokenMiddleware`
  for the Dashboard API, `saleorWebhookValidationMiddleware` for webhooks. Both set
  `saleorApiUrl` and `saleorDomain` only after verifying a signature against that
  installation's JWKS. A route that touches tenant data and sits behind neither
  answers to whoever asked; `saleorTenantMiddleware()` refuses one that slipped
  through, but it verifies nothing itself.
- The webhook signature covers the body and nothing else, so every other Saleor
  header is caller-controlled and survives verification unchanged. Log
  `saleor-event`, never branch on it — the route it arrived on is the trusted
  statement of which event this is, and that comes from the webhook registry.
- A tenant-scoped route reads its Saleor from `requireSaleorTenant(context)` and from
  nowhere else. Only a middleware that verified a signature against that
  installation's JWKS publishes it; a domain taken from a body, a header or a path is
  a claim the caller wrote, and treating it as the tenant lets a verified caller act
  on an installation it never proved it belongs to.
- Import siblings through `#root/*`, never with a relative path that climbs directories.
- Return `Result` from fallible operations; throw `HttpError` subclasses only where the
  global error handler turns them into a response.
- `src/client/**` is browser code for the Dashboard iframe. Keep it free of Node built-ins
  and of anything a server bundle would have to carry.
- React components go under `src/client/components/**` and nowhere else; everything else
  in the package is `.ts`. The export map resolves one extension per subpath, so a `.tsx`
  file outside that directory is unreachable to consumers.
- Run `pnpm --filter @nimara/lib test lint lint:types`, then the consuming app's suite —
  `pnpm --filter stripe test` is the gate this package was extracted against.
