# Commerce flows

Use the smallest flow that satisfies the buyer's intent. Ask one concise question at a time and preserve confirmed state between steps.

## Product discovery

1. Discover capabilities and the REST endpoint.
2. Ask for a query or filter if neither is known.
3. Search the catalog.
4. Present a short list with title, relevant variant, availability, and formatted price.
5. Look up product detail when options or an exact identifier must be resolved.
6. Ask the buyer to confirm product, variant, and quantity before starting checkout.

## Cart management

Use a cart when the buyer wants to collect items without committing to purchase.

1. Resolve real variant identifiers through catalog search or lookup.
2. Create the cart and store its returned identifier.
3. Retrieve the cart before an update when the full current state is not already known.
4. Send the complete desired state for replacement updates.
5. Confirm cancellation before canceling an active cart.

## Checkout creation

1. Confirm purchase intent, product or cart, and quantity.
2. Collect the minimum buyer data required by the discovered schema.
3. Create checkout from confirmed line items or the cart identifier.
4. Store the returned session identifier and status.
5. Read `messages[]` before asking for the next missing field.

## Checkout update

1. Retrieve current state when it may be stale.
2. Identify the one missing or changed input needed next.
3. Ask for that input and confirm sensitive or consequential values.
4. Update the session with fields accepted by the discovered schema.
5. Re-evaluate the returned status and messages.
6. Repeat until ready, canceled, completed, or escalated.

## Checkout completion

1. Require `ready_for_complete`; otherwise retrieve or update the session first.
2. Summarize product, quantity, total, currency, and fulfillment for final buyer confirmation.
3. Require an explicit confirmation in the active conversation.
4. Use a valid payment instrument without displaying its token.
5. Complete exactly once, using safe retry semantics only when supported.
6. Return the order identifier and confirmation link from the response.

If completion is already in progress, retrieve the session instead of issuing another completion request.

## Cancellation

1. Retrieve the active cart or checkout when its state is uncertain.
2. Explain what will be canceled and request confirmation.
3. Call the relevant cancel endpoint.
4. Stop using the canceled resource.

## Escalation and errors

- For recoverable messages, explain the correction and retry only after fixing the input.
- For `requires_buyer_input` or `requires_buyer_review`, present `continue_url` and wait for buyer action.
- For unrecoverable messages, stop the resource flow and offer a fresh search, cart, or checkout where appropriate.
- For profile or version negotiation failures, do not call commerce endpoints; report the discovery problem.
- For ambiguous network failures after a mutation, retrieve the resource before retrying.

## Order retrieval

1. Use only an order identifier returned by checkout or supplied by the buyer.
2. Retrieve the order through the negotiated endpoint.
3. Present status, items, fulfillment expectations or events, total, and permalink when available.

## State transitions

```text
search -> product confirmed -> cart (optional) -> checkout incomplete
checkout incomplete -> update -> ready_for_complete
ready_for_complete -> buyer confirms -> complete_in_progress -> completed -> order
cart or checkout -> confirmed cancellation -> canceled
checkout -> buyer action required -> requires_escalation -> continue_url
```

Never infer a transition. Accept only the status returned by the API.
