# UCP Continue URL Conditions

This document explains how to use `continueUrlConditions` parameter in `toUCPCheckoutSession()` to control when checkout handoff to business UI is required.

## Overview

The `continue_url` field enables checkout handoff from platform to business UI for scenarios where the platform cannot complete the checkout programmatically.

**Spec Reference:** https://ucp.dev/2026-01-23/specification/checkout/#continue-url

## When to Generate continue_url

According to UCP spec:

- **MUST** when `status: requires_escalation` (buyer input needed)
- **SHOULD** for non-terminal statuses (`incomplete`, `ready_for_complete`, `complete_in_progress`)
- **SHOULD NOT** for terminal states (`completed`, `canceled`)

## Implementation Pattern

Pass conditions to `toUCPCheckoutSession()` to determine if continue_url is needed:

```typescript
const conditions = {
  missingEmail: currentCheckout.email === null,
  missingBillingAddress: !currentCheckout.billingAddress,
  missingShippingAddress: !currentCheckout.shippingAddress,
  missingDeliveryMethod: !currentCheckout.deliveryMethod,
  customBusinessRule: someCondition,
};

const session = toUCPCheckoutSession(
  checkout,
  undefined,
  baseUrl,
  conditions,
);
```

If **any** condition is `true`, the `continue_url` will be generated as:
```
{baseUrl}/checkout/{checkoutId}
```

## Common Conditions

### Missing Required Data

```typescript
{
  missingEmail: !checkout.email,
  missingBillingAddress: !checkout.billingAddress,
  missingShippingAddress: !checkout.shippingAddress,
  missingDeliveryMethod: !checkout.deliveryMethod,
}
```

### Before Complete Checkout

When completing checkout, if required data is missing:

```typescript
{
  // Missing email is common reason to hand off for completion
  needsEmailForCompletion: !currentCheckout.email,
}
```

### Custom Business Requirements

Add any domain-specific conditions:

```typescript
{
  requiresAgeVerification: orderValue > ageRestrictedThreshold,
  requiresSignIn: !user && requiresAccountForThisProduct,
  requiresTermsAcceptance: !hasAcceptedTerms,
}
```

## Continue URL Format

The current implementation uses **server-side state** (recommended by spec):

```
https://business.example.com/checkout/{checkout_id}
```

- Simple and secure
- Server maintains state tied to `checkout_id`
- URL lifetime tied to `expires_at` (6 hours default)

## Future Enhancement

For stateless **Checkout Permalink** format (optional by spec):

```
https://business.example.com/checkout?state=<encoded_checkout_state>
```

This would require state serialization. See spec reference for details.

## Service Implementation Examples

### In Complete Checkout

```typescript
// Check if email is missing - need handoff
const needsContinueUrl = !currentCheckout.email;

const session = toUCPCheckoutSession(
  checkoutResult.data.checkout,
  undefined,
  baseUrl,
  { missingEmail: needsContinueUrl },
);
```

### In Update Checkout

```typescript
// Hand off if multiple critical fields missing
const conditions = {
  missingEmail: !checkout.email,
  missingAddresses: !checkout.billingAddress || !checkout.shippingAddress,
  missingShipping: !checkout.deliveryMethod,
};

const session = toUCPCheckoutSession(
  checkout,
  undefined,
  baseUrl,
  conditions,
);
```

## Integration with Status

Conditions should align with status transitions:

| Status | Reason | continue_url | Example Condition |
|--------|--------|-------------|------------------|
| `incomplete` | Missing data | SHOULD | `{ missingEmail: true }` |
| `requires_escalation` | Needs buyer input | MUST | `{ needsBuyerAction: true }` |
| `ready_for_complete` | All data present | SHOULD | `{ }` (falsy → no URL) |
| `completed` | Order placed | NO | N/A |

## Testing

Test both scenarios:

1. **No escalation needed** (all conditions false):
   ```typescript
   const conditions = {
     missingEmail: false,
     missingAddresses: false,
   };
   // Result: continue_url should be undefined
   ```

2. **Escalation needed** (at least one true):
   ```typescript
   const conditions = {
     missingEmail: true,
     missingAddresses: false,
   };
   // Result: continue_url = "https://base.com/checkout/id123"
   ```
