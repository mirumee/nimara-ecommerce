# Request examples

Use placeholders below only as a shape guide. Replace every URL, identifier, version, and value with discovery output, API data, or confirmed buyer input.

## Structured instruction envelope

Use this form only when the surrounding system expects an API instruction instead of executing the request directly:

```json
{
  "action": "api_call",
  "endpoint": "<discovered-base-url>/catalog/search",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "UCP-Agent": "profile=\"https://platform.example/.well-known/ucp\"",
    "Request-Id": "<new-request-id>"
  },
  "payload": {
    "query": "running shoes",
    "pagination": { "limit": 10 }
  }
}
```

## Discovery

```json
{
  "action": "api_call",
  "endpoint": "https://storefront.example/.well-known/ucp",
  "method": "GET",
  "headers": {},
  "payload": null
}
```

Read the REST service endpoint from the response before constructing later URLs.

## Create cart

```json
{
  "action": "api_call",
  "endpoint": "<discovered-base-url>/carts",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "UCP-Agent": "profile=\"https://platform.example/.well-known/ucp\"",
    "Request-Id": "<new-request-id>"
  },
  "payload": {
    "line_items": [
      { "item": { "id": "<confirmed-variant-id>" }, "quantity": 1 }
    ]
  }
}
```

## Create checkout

```json
{
  "action": "api_call",
  "endpoint": "<discovered-base-url>/checkout-sessions",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "UCP-Agent": "profile=\"https://platform.example/.well-known/ucp\"",
    "Idempotency-Key": "<stable-key-for-this-create-attempt>",
    "Request-Id": "<new-request-id>"
  },
  "payload": {
    "line_items": [
      {
        "item": {
          "id": "<confirmed-variant-id>",
          "title": "<api-returned-title>"
        },
        "quantity": 1
      }
    ],
    "buyer": { "email": "<confirmed-email>" }
  }
}
```

To convert a cart, use the request shape advertised by the discovered checkout schema and pass the real cart identifier.

## Update checkout

```json
{
  "action": "api_call",
  "endpoint": "<discovered-base-url>/checkout-sessions/<checkout-id>",
  "method": "PUT",
  "headers": {
    "Content-Type": "application/json",
    "UCP-Agent": "profile=\"https://platform.example/.well-known/ucp\"",
    "Request-Id": "<new-request-id>"
  },
  "payload": {
    "buyer": {
      "first_name": "<confirmed-first-name>",
      "last_name": "<confirmed-last-name>"
    },
    "fulfillment": {
      "methods": [
        {
          "id": "<api-returned-method-id>",
          "selected_destination_id": "<destination-id>",
          "destinations": [
            {
              "id": "<destination-id>",
              "street_address": "<confirmed-street>",
              "address_locality": "<confirmed-city>",
              "postal_code": "<confirmed-postal-code>",
              "address_country": "<confirmed-country-code>"
            }
          ]
        }
      ]
    }
  }
}
```

## Complete checkout

```json
{
  "action": "api_call",
  "endpoint": "<discovered-base-url>/checkout-sessions/<checkout-id>/complete",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "UCP-Agent": "profile=\"https://platform.example/.well-known/ucp\"",
    "Request-Id": "<new-request-id>"
  },
  "payload": {
    "payment": {
      "instrument": {
        "type": "<supported-instrument-type>",
        "token": "<secret-token>"
      }
    }
  }
}
```

Never repeat the payment token in the buyer-facing response.
