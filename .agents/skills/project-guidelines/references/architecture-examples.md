# Architecture examples

Use these examples to resolve ambiguous placement. Match the responsibility, not merely the
filename or technology.

## Add an external commerce capability

For a provider operation such as fetching availability or updating a checkout:

1. Put provider-neutral entities or values in `packages/domain` only if other capabilities
   share them.
2. Put the use-case contract, provider adapter, GraphQL source, and response translation in
   `packages/infrastructure`.
3. Put reusable UI plus feature state or orchestration in `packages/features`.
4. Select the concrete provider and connect it to routing in the consuming app.
5. Regenerate GraphQL output; never edit it manually.

Do not expose provider response types to apps. Return a domain or use-case contract through
the infrastructure boundary.

## Place a utility

- A pure rule expressed in commerce language belongs in `domain`.
- A generic formatter, parser, or reusable hook belongs in `foundation`.
- A helper coupled to one capability stays beside that capability.
- A helper coupled to one route or app stays in that app.

Do not promote a one-use helper merely because it could be shared someday.

## Distinguish UI from features

Put a component in `ui` when it receives data and callbacks through props and does not know
about commerce flows, providers, routing, or app configuration.

Put it in `features` when it coordinates feature state, validation, infrastructure
contracts, or multiple UI primitives. Keep final route composition in the app.

## Keep app-specific behavior local

Headers, route layouts, environment selection, middleware, and service registries normally
belong to one app. Extract reusable components or contracts, not the app's composition root.

Apps must communicate through shared contracts or external services, never by importing
another app's source.

## Recognize boundary violations

- `domain` imports a framework or reads an environment variable: move the external concern
  outward and pass plain values into the rule.
- `infrastructure` imports a React component: return data through a contract and let a
  feature render it.
- `ui` fetches a product by identifier: fetch in infrastructure or the app and pass the
  product as props.
- an app imports generated GraphQL types: expose a provider-neutral infrastructure contract.
- two layers import each other: move their shared contract toward `domain` or invert the
  dependency through an interface.

## Review a new feature

Before finishing, verify:

- each behavior has one owning layer;
- shared types are genuinely provider-neutral;
- external failures use the Result pattern;
- provider details stop at the infrastructure boundary;
- routing and provider selection remain app-specific;
- unit tests cover owned logic and E2E tests cover only critical journeys.
