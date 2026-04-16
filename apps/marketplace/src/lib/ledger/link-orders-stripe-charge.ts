import { MetadataUpdateDocument } from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";
import { getLedgerPool } from "@/lib/ledger/pool";
import { updateLedgerStripeChargeForOrders } from "@/lib/ledger/repository";
import { METADATA_KEYS } from "@/lib/saleor/consts";
import { getStripeClient } from "@/lib/stripe/client";
import { marketplaceLogger } from "@/services/logging";

/** Resolve Stripe Charge id (ch_…) for a PaymentIntent (pi_…). */
export async function getChargeIdFromPaymentIntentId(
  paymentIntentId: string,
): Promise<string | null> {
  const stripe = getStripeClient();
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge"],
  });
  const lc = pi.latest_charge;

  if (typeof lc === "string") {
    return lc;
  }

  if (lc && typeof lc === "object" && "id" in lc) {
    return (lc as { id: string }).id;
  }

  marketplaceLogger.warning(
    "[stripe] PaymentIntent has no latest_charge; ledger may miss charge.succeeded linkage",
    { paymentIntentId },
  );

  return null;
}

/**
 * After payment_intent.succeeded: resolve Charge id (ch_…) and attach to Saleor orders + ledger.
 * Connect webhook charge.succeeded updates settlement by stripe_charge_id on ledger_entries.
 */
export async function linkOrdersToStripeChargeFromPaymentIntent(input: {
  authToken: string;
  orderIds: string[];
  paymentIntentId: string;
}): Promise<{ chargeId: string } | null> {
  const uniqueOrderIds = [...new Set(input.orderIds.filter(Boolean))];

  if (uniqueOrderIds.length === 0) {
    return null;
  }

  const chargeId = await getChargeIdFromPaymentIntentId(input.paymentIntentId);

  if (!chargeId) {
    return null;
  }

  const pool = getLedgerPool();

  if (pool) {
    await updateLedgerStripeChargeForOrders(pool, {
      chargeId,
      orderIds: uniqueOrderIds,
    });
  }

  for (const orderId of uniqueOrderIds) {
    const metaResult = await executeGraphQL(
      MetadataUpdateDocument,
      "MetadataUpdateMutation",
      {
        id: orderId,
        input: [{ key: METADATA_KEYS.STRIPE_CHARGE_ID, value: chargeId }],
      },
      input.authToken,
    );

    if (!metaResult.ok) {
      marketplaceLogger.warning(
        "[stripe] updateMetadata stripe_charge_id failed for order",
        { errors: metaResult.errors, orderId },
      );
    }
  }

  return { chargeId };
}
