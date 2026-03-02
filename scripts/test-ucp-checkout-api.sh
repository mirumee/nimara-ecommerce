#!/bin/bash
# Test UCP checkout session API - full flow with email, lines, shipping & billing address
# Usage: ./scripts/test-checkout-api.sh [BASE_URL]
# Example: ./scripts/test-checkout-api.sh http://localhost:3000

set -e

BASE_URL="${1:-http://localhost:3000}"
CHANNEL_SLUG="channel-us"
VARIANT_ID="UHJvZHVjdFZhcmlhbnQ6NzE5"

echo "Testing UCP checkout API (full checkout) at ${BASE_URL}"
echo "Channel: ${CHANNEL_SLUG}, Variant ID: ${VARIANT_ID}"
echo ""

# 1. UCP: Create checkout session
echo "1. UCP POST /api/ucp/${CHANNEL_SLUG}/checkout-sessions (create)"
CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${BASE_URL}/api/ucp/${CHANNEL_SLUG}/checkout-sessions" \
  -H "Content-Type: application/json" \
  -d "{\"line_items\":[{\"item\":{\"id\":\"${VARIANT_ID}\"},\"quantity\":1}]}")

CREATE_BODY=$(echo "$CREATE_RESPONSE" | sed '$d')
CREATE_STATUS=$(echo "$CREATE_RESPONSE" | tail -1)
echo "   Status: ${CREATE_STATUS}"
echo "$CREATE_BODY" | jq . 2>/dev/null || echo "$CREATE_BODY"
echo ""

CHECKOUT_ID=$(echo "$CREATE_BODY" | jq -r '.id // empty' 2>/dev/null)
if [ -z "$CHECKOUT_ID" ] || [ "$CHECKOUT_ID" = "null" ]; then
  echo "ERROR: Failed to create checkout session, aborting"
  exit 1
fi

# 2. UCP: GET checkout session
echo "2. UCP GET /api/ucp/${CHANNEL_SLUG}/checkout-sessions/${CHECKOUT_ID}"
GET_RESPONSE=$(curl -s -w "\n%{http_code}" \
  "${BASE_URL}/api/ucp/${CHANNEL_SLUG}/checkout-sessions/${CHECKOUT_ID}")
GET_BODY=$(echo "$GET_RESPONSE" | sed '$d')
GET_STATUS=$(echo "$GET_RESPONSE" | tail -1)
echo "   Status: ${GET_STATUS}"
echo "$GET_BODY" | jq . 2>/dev/null || echo "$GET_BODY"
echo ""

# 3. UCP: PUT update - full checkout (buyer, lines, shipping address, billing address)
echo "3. UCP PUT /api/ucp/${CHANNEL_SLUG}/checkout-sessions/${CHECKOUT_ID} (full update)"
UPDATE_PAYLOAD=$(jq -n \
  --arg vid "$VARIANT_ID" \
  '{
    line_items: [{item: {id: $vid}, quantity: 2}],
    buyer: {
      email: "test@example.com",
      first_name: "Test",
      last_name: "User"
    },
    fulfillment: {
      methods: [{
        destinations: [{
          street_address: "123 Main St",
          address_locality: "New York",
          address_region: "NY",
          postal_code: "10001",
          address_country: "US",
          first_name: "Test",
          last_name: "User"
        }]
      }]
    },
    billing_address: {
      street_address: "456 Billing Ave",
      address_locality: "Brooklyn",
      address_region: "NY",
      postal_code: "11201",
      address_country: "US",
      first_name: "Test",
      last_name: "User"
    }
  }' 2>/dev/null)
if [ -z "$UPDATE_PAYLOAD" ]; then
  UPDATE_PAYLOAD='{"line_items":[{"item":{"id":"'"${VARIANT_ID}"'"},"quantity":2}],"buyer":{"email":"test@example.com","first_name":"Test","last_name":"User"},"fulfillment":{"methods":[{"destinations":[{"street_address":"123 Main St","address_locality":"New York","address_region":"NY","postal_code":"10001","address_country":"US","first_name":"Test","last_name":"User"}]}]},"billing_address":{"street_address":"456 Billing Ave","address_locality":"Brooklyn","address_region":"NY","postal_code":"11201","address_country":"US","first_name":"Test","last_name":"User"}}'
fi

UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
  "${BASE_URL}/api/ucp/${CHANNEL_SLUG}/checkout-sessions/${CHECKOUT_ID}" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_PAYLOAD")

UPDATE_BODY=$(echo "$UPDATE_RESPONSE" | sed '$d')
UPDATE_STATUS=$(echo "$UPDATE_RESPONSE" | tail -1)
echo "   Status: ${UPDATE_STATUS}"
echo "$UPDATE_BODY" | jq . 2>/dev/null || echo "$UPDATE_BODY"
echo ""

# 4. UCP: GET to verify full checkout response
echo "4. UCP GET /api/ucp/${CHANNEL_SLUG}/checkout-sessions/${CHECKOUT_ID} (verify full checkout)"
GET2_RESPONSE=$(curl -s -w "\n%{http_code}" \
  "${BASE_URL}/api/ucp/${CHANNEL_SLUG}/checkout-sessions/${CHECKOUT_ID}")
GET2_BODY=$(echo "$GET2_RESPONSE" | sed '$d')
GET2_STATUS=$(echo "$GET2_RESPONSE" | tail -1)
echo "   Status: ${GET2_STATUS}"
echo "$GET2_BODY" | jq . 2>/dev/null || echo "$GET2_BODY"

# Verify expected fields
echo ""
echo "--- Verification ---"
HAS_BUYER=$(echo "$GET2_BODY" | jq 'has("buyer") and .buyer != null' 2>/dev/null || echo "false")
HAS_FULFILLMENT=$(echo "$GET2_BODY" | jq 'has("fulfillment_address") and .fulfillment_address != null' 2>/dev/null || echo "false")
HAS_BILLING=$(echo "$GET2_BODY" | jq 'has("billing_address") and .billing_address != null' 2>/dev/null || echo "false")
HAS_LINES=$(echo "$GET2_BODY" | jq '.line_items | length > 0' 2>/dev/null || echo "false")

echo "buyer: $HAS_BUYER | fulfillment_address: $HAS_FULFILLMENT | billing_address: $HAS_BILLING | line_items: $HAS_LINES"
echo "--- Summary ---"
echo "Create: ${CREATE_STATUS} | Get: ${GET_STATUS} | Update: ${UPDATE_STATUS} | Get(verify): ${GET2_STATUS}"
echo "Checkout ID: ${CHECKOUT_ID}"
