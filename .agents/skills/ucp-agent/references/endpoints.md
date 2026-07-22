# Nimara UCP REST endpoints

Use the REST service endpoint returned by the target storefront's discovery profile as the base URL. Never assume a channel slug or deployment origin when discovery provides them.

## Discovery and negotiation

| Method | Path               | Purpose                                                                                      |
| ------ | ------------------ | -------------------------------------------------------------------------------------------- |
| `GET`  | `/.well-known/ucp` | Discover protocol version, REST endpoint, capabilities, schemas, specs, and payment handlers |

Fetch discovery before commerce calls. Nimara validates the platform profile supplied by `UCP-Agent` and negotiates the intersection of compatible capabilities.

## Request headers

| Header                                           | Use                                                                                     |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `Content-Type: application/json`                 | Include on requests with JSON bodies                                                    |
| `UCP-Agent: profile="https://…/.well-known/ucp"` | Include on every UCP commerce request                                                   |
| `Request-Id`                                     | Use a fresh correlation identifier per request                                          |
| `Idempotency-Key`                                | Use only for operations whose implementation advertises or documents idempotent retries |
| `Authorization`                                  | Send only when required by the target deployment; Nimara does not currently validate it |

Do not treat `UCP-Agent` capability negotiation as caller authentication.

## Catalog

| Method | Relative path      | Purpose                                       |
| ------ | ------------------ | --------------------------------------------- |
| `POST` | `/catalog/search`  | Search by query and/or filters                |
| `POST` | `/catalog/lookup`  | Batch lookup by product or variant identifier |
| `POST` | `/catalog/product` | Retrieve one product with full option detail  |

## Cart

| Method | Relative path        | Purpose            |
| ------ | -------------------- | ------------------ |
| `POST` | `/carts`             | Create a cart      |
| `GET`  | `/carts/{id}`        | Retrieve a cart    |
| `PUT`  | `/carts/{id}`        | Replace cart state |
| `POST` | `/carts/{id}/cancel` | Cancel a cart      |

## Checkout

| Method | Relative path                      | Purpose                                                     |
| ------ | ---------------------------------- | ----------------------------------------------------------- |
| `POST` | `/checkout-sessions`               | Create a session or convert a cart                          |
| `GET`  | `/checkout-sessions/{id}`          | Retrieve current session state                              |
| `PUT`  | `/checkout-sessions/{id}`          | Update buyer, fulfillment, discount, or other accepted data |
| `POST` | `/checkout-sessions/{id}/cancel`   | Cancel a session                                            |
| `POST` | `/checkout-sessions/{id}/complete` | Place the order after readiness and buyer confirmation      |

## Order

| Method | Relative path  | Purpose                                 |
| ------ | -------------- | --------------------------------------- |
| `GET`  | `/orders/{id}` | Retrieve order details after completion |

## Repository implementation map

| Concern                          | Location                                   |
| -------------------------------- | ------------------------------------------ |
| Discovery route                  | `apps/storefront/src/app/.well-known/ucp/` |
| REST route handlers              | `apps/storefront/src/app/api/ucp/`         |
| Capabilities and negotiation     | `apps/storefront/src/features/ucp/`        |
| Saleor use-cases and serializers | `packages/infrastructure/src/ucp/`         |

## Current Nimara constraints

- The discovery profile advertises one configured default channel; use its endpoint instead of constructing another channel URL.
- `Authorization` and request signatures are not currently validated by the repository implementation.
- Checkout-create idempotency uses process-local storage; do not assume deduplication across instances.
- Cart operations do not provide the same idempotency guarantee.
- UCP carts map to Saleor checkouts internally, so cart and checkout identifiers can refer to the same underlying resource.
- Cancellation is emulated through Saleor checkout metadata and line updates rather than a native Saleor cancellation operation.

Re-check the route handlers before relying on these constraints in production-facing guidance because implementation behavior can change independently of this skill.
