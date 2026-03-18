# UCP Implementation Update - 2026-01-23

## Summary

Implementation of critical UCP 2026-01-23 specification compliance features for Nimara Storefront checkout capability.

**Specification Reference:** https://ucp.dev/2026-01-23/specification/checkout/

## Changes Implemented

### 1. Links Support (REQUIRED by Spec)

**What:** Added required legal compliance links to all checkout responses.

**Files Modified:**
- `packages/infrastructure/src/ucp/saleor/helpers.ts` - Added `generateCheckoutLinks(baseUrl)`
- `packages/infrastructure/src/ucp/saleor/serializers.ts` - Integrated links generation

**Well-Known Link Types Provided:**
- `privacy_policy` - Privacy Policy
- `terms_of_service` - Terms of Service  
- `refund_policy` - Refund Policy
- `shipping_policy` - Shipping Policy

**Implementation Details:**
- Links are generated from base URL (storefront URL)
- URL pattern: `{baseUrl}/{policy-slug}`
- Example: `https://storefront.example.com/privacy-policy`
- Links included in all checkout responses

**Spec Requirement:** "Mandatory for legal compliance. Links to be displayed by the platform (Privacy Policy, TOS)."

---

### 2. Expires_at Support (RECOMMENDED)

**What:** Added RFC 3339 formatted expiration timestamp to checkout responses.

**Files Modified:**
- `packages/infrastructure/src/ucp/saleor/helpers.ts` - Added `calculateCheckoutExpiration(ttlSeconds)`
- `packages/infrastructure/src/ucp/saleor/serializers.ts` - Integrated into session model

**Implementation Details:**
- Default TTL: 6 hours (21,600 seconds)
- Format: RFC 3339 ISO 8601 (e.g., `2026-03-18T18:15:00.000Z`)
- Conversion: Internal ISO string → SDK Date object (handled in response serialization)
- Expires at checkout creation time + TTL

**Alignment with Saleor:**
- Saleor auto-deletes checkouts after TTL:
  - Empty checkouts: 6 hours
  - Anonymous with items: 30 days
  - User with items: 90 days
  - See: https://docs.saleor.io/developer/checkout/lifecycle#checkout-expiration-and-deletion

**Spec Requirement:** "Optional but recommended. Default TTL is 6 hours from creation if not sent."

---

### 3. Continue URL Support (REQUIRED for Escalation, SHOULD for Non-Terminal)

**What:** Added checkout handoff URL for platform → business UI transitions.

**Files Modified:**
- `packages/infrastructure/src/ucp/saleor/helpers.ts` - Added `generateContinueUrl(checkoutId, baseUrl, conditions)`
- `packages/infrastructure/src/ucp/saleor/serializers.ts` - Integrated conditional URL generation
- `packages/infrastructure/src/ucp/saleor/types.ts` - Added `ContinueUrlConditions` type
- `packages/infrastructure/src/ucp/CONTINUE_URL_CONDITIONS.md` - Comprehensive usage guide

**Implementation Pattern:**

```typescript
// Define conditions for escalation
const conditions = {
  missingEmail: !checkout.email,
  missingBillingAddress: !checkout.billingAddress,
  missingShippingAddress: !checkout.shippingAddress,
  missingDeliveryMethod: !checkout.deliveryMethod,
  // Add custom business conditions as needed
};

// Generate session with conditional continue_url
const session = toUCPCheckoutSession(
  checkout,
  undefined,
  baseUrl,
  conditions  // If any condition is true, continue_url is generated
);
```

**URL Format (Server-Side State - Recommended):**
```
https://storefront.example.com/checkout/{checkoutId}
```

- Simple and secure
- Server maintains state tied to checkout_id
- URL lifetime tied to expires_at (6 hours default)

**When to Use:**
- **MUST**: When `status: requires_escalation` (buyer input needed)
- **SHOULD**: For non-terminal statuses (`incomplete`, `ready_for_complete`, `complete_in_progress`)
- **NO**: For terminal states (`completed`, `canceled`)

**Spec Requirement:** "URL for checkout handoff and session recovery. MUST be provided when status is requires_escalation."

---

### 4. Checkout Cancellation (Documented Limitation)

**What:** Documented why cancellation is not supported in Saleor.

**Files Modified:**
- `packages/infrastructure/src/ucp/saleor/service.ts` - Enhanced `cancelCheckout()` error message

**Status:** Returns error with explanation
- Saleor does not provide checkout deletion/cancellation API
- Checkouts auto-expire after TTL
- Alternative: Remove all lines from checkout (expires in 6 hours)

**Spec Compliance:** 
- Spec allows returning error when operation not supported
- Recommendation: "Any checkout session with a status that is not equal to completed or canceled SHOULD be cancelable."
- Current approach: Document as limitation, return descriptive error

---

## Updated Type Definitions

### UCPCheckoutSessionModel

**New Fields:**
```typescript
export type UCPCheckoutSessionModel = {
  // New required field
  links: LinkElement[];
  
  // New optional fields
  expiresAtISO?: string;           // RFC 3339 timestamp for expiration
  continueUrl?: string;            // URL for checkout handoff
  
  // ... existing fields ...
};
```

### ContinueUrlConditions

```typescript
export type ContinueUrlConditions = {
  missingEmail?: boolean;
  missingBillingAddress?: boolean;
  missingShippingAddress?: boolean;
  missingDeliveryMethod?: boolean;
  [key: string]: boolean | undefined;
};
```

---

## API Changes

### toUCPCheckoutSession()

**New Signature:**
```typescript
export const toUCPCheckoutSession = (
  checkout: SaleorCheckout,
  order?: { id: string; permalinkUrl: string },
  baseUrl?: string,
  continueUrlConditions?: Record<string, boolean>,
): UCPCheckoutSessionModel
```

**Breaking Change:** Added `baseUrl` parameter (required for links generation)

**Migration:**
```typescript
// Before
const session = toUCPCheckoutSession(checkout);

// After
const session = toUCPCheckoutSession(checkout, undefined, baseUrl);

// With conditions
const session = toUCPCheckoutSession(
  checkout,
  undefined,
  baseUrl,
  { missingEmail: !checkout.email }
);
```

---

## Response Schema Updates

All checkout responses now include:

```json
{
  "id": "...",
  "status": "...",
  "currency": "...",
  "totals": [...],
  "line_items": [...],
  
  // NEW: Legal compliance links (REQUIRED)
  "links": [
    {
      "type": "privacy_policy",
      "url": "https://storefront.example.com/privacy-policy",
      "title": "Privacy Policy"
    },
    // ... more links
  ],
  
  // NEW: Expiration timestamp (OPTIONAL)
  "expires_at": "2026-03-18T18:15:00.000Z",
  
  // NEW: Checkout handoff URL (CONDITIONAL)
  "continue_url": "https://storefront.example.com/checkout/...",
  
  // ... existing fields ...
}
```

---

## Future Enhancements

### Phase 2 (Error Handling)
- Implement `messages` array for error/warning/info messages
- Add message severity levels (recoverable, requires_buyer_input, requires_buyer_review)
- Derive status from error messages (especially requires_escalation)

### Phase 3 (Payment Instruments)
- Populate `payment.instruments` array with collected data
- Validate credentials against handler schema
- Forward risk_signals in complete operation

### Phase 4 (Stateless Continue URL)
- Implement Checkout Permalink format (optional by spec)
- URL-encoded state instead of server-side lookup
- Reduces server state requirements

---

## Testing Checklist

- [ ] All checkout operations include proper links
- [ ] expires_at is RFC 3339 formatted and valid
- [ ] continue_url generates correctly when conditions are true
- [ ] continue_url is undefined when all conditions are false
- [ ] Links match well-known types from spec
- [ ] All responses validate against OpenAPI schema
- [ ] E2E test with complete checkout flow
- [ ] Test condition combinations

---

## Documentation

- `CONTINUE_URL_CONDITIONS.md` - Detailed guide for continue_url usage
- `IMPLEMENTATION_SUMMARY.md` - This file
- Inline code comments in helpers and serializers

---

## References

- **UCP Spec:** https://ucp.dev/2026-01-23/specification/checkout/
- **Saleor Checkout Lifecycle:** https://docs.saleor.io/developer/checkout/lifecycle
- **UCP Links:** https://ucp.dev/2026-01-23/specification/checkout/#link
- **UCP Continue URL:** https://ucp.dev/2026-01-23/specification/checkout/#continue-url
