import { type NextRequest, NextResponse } from "next/server";

import { MetadataUpdateDocument } from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";
import { ingestOrderPaidToLedger } from "@/lib/ledger/ingest-order-paid";
import { getChargeIdFromPaymentIntentId } from "@/lib/ledger/link-orders-stripe-charge";
import { getLedgerPool } from "@/lib/ledger/pool";
import { updateLedgerStripeChargeForOrders } from "@/lib/ledger/repository";
import { applySettlementForCharge } from "@/lib/ledger/sync-ledger-settlement-from-stripe";
import { getAppConfig } from "@/lib/saleor/app-config";
import { METADATA_KEYS } from "@/lib/saleor/consts";
import {
  fetchOrderSnapshotForLedger,
  type OrderLedgerSnapshot,
  pickPaymentIntentIdFromOrderSnapshot,
  resolveVendorIdFromOrderSnapshot,
} from "@/lib/saleor/fetch-order-for-ledger";
import { marketplaceLogger } from "@/services/logging";

type OrderShape = {
  id: string;
  metadata?: Array<{ key: string; value: string }>;
  total?: {
    gross?: { amount?: number | string; currency?: string };
  };
};

function extractOrderFromWebhookBody(body: unknown): OrderShape | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const root = body as Record<string, unknown>;

  if (root.order && typeof root.order === "object" && "id" in root.order) {
    return root.order as OrderShape;
  }

  if (
    root.__typename === "OrderPaid" &&
    root.order &&
    typeof root.order === "object"
  ) {
    return root.order as OrderShape;
  }

  const topLevelEvent = root.event;

  if (topLevelEvent && typeof topLevelEvent === "object") {
    const ev = topLevelEvent as Record<string, unknown>;

    if (ev.order && typeof ev.order === "object" && "id" in ev.order) {
      return ev.order as OrderShape;
    }
  }

  const data = root.data;

  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const event = d.event;

    if (event && typeof event === "object") {
      const ev = event as Record<string, unknown>;

      if (ev.order && typeof ev.order === "object" && "id" in ev.order) {
        return ev.order as OrderShape;
      }
    }

    const orderPaid = d.orderPaid;

    if (orderPaid && typeof orderPaid === "object") {
      const op = orderPaid as Record<string, unknown>;

      if (op.order && typeof op.order === "object" && "id" in op.order) {
        return op.order as OrderShape;
      }
    }
  }

  return null;
}

function findMetadata(
  metadata: Array<{ key: string; value: string }> | undefined,
  key: string,
): string | null {
  const item = metadata?.find((m) => m.key === key);

  return item?.value?.trim() || null;
}

function webhookOrderToSnapshot(order: OrderShape): OrderLedgerSnapshot {
  const gross = order.total?.gross;

  return {
    lines: [],
    metadata: order.metadata ?? [],
    total:
      gross?.currency != null &&
      gross.amount !== undefined &&
      gross.amount !== null
        ? {
            gross: {
              amount:
                typeof gross.amount === "number"
                  ? gross.amount
                  : Number.parseFloat(String(gross.amount)),
              currency: String(gross.currency),
            },
          }
        : null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const saleorDomain = request.headers.get("saleor-domain");

    if (!saleorDomain) {
      return NextResponse.json(
        { error: "Missing saleor-domain header" },
        { status: 400 },
      );
    }

    const appConfig = await getAppConfig(saleorDomain);

    if (!appConfig) {
      return NextResponse.json(
        { error: "App not configured for this domain" },
        { status: 500 },
      );
    }

    const bodyUnknown: unknown = await request.json();
    const orderFromWebhook = extractOrderFromWebhookBody(bodyUnknown);

    if (!orderFromWebhook?.id) {
      marketplaceLogger.warning(
        "[order-paid] skipped: could not parse order from payload",
        {
          bodyKeys:
            bodyUnknown && typeof bodyUnknown === "object"
              ? Object.keys(bodyUnknown)
              : [],
        },
      );

      return NextResponse.json({ status: "skipped", reason: "no_order" });
    }

    const snapshotFromSaleor = await fetchOrderSnapshotForLedger({
      authToken: appConfig.authToken,
      orderId: orderFromWebhook.id,
      saleorDomain,
    });

    const webhookSnapshot = webhookOrderToSnapshot(orderFromWebhook);
    const snapshot: OrderLedgerSnapshot = snapshotFromSaleor ?? webhookSnapshot;

    const occurredAtForLedger =
      snapshot.created != null
        ? (() => {
            const d = new Date(snapshot.created);

            return Number.isNaN(d.getTime()) ? new Date() : d;
          })()
        : new Date();

    const vendorId =
      resolveVendorIdFromOrderSnapshot(snapshot) ??
      resolveVendorIdFromOrderSnapshot(webhookSnapshot);

    if (!vendorId) {
      marketplaceLogger.warning(
        "[order-paid] skipped: no vendor on order or lines",
        {
          orderId: orderFromWebhook.id,
          usedSaleorFetch: snapshotFromSaleor != null,
        },
      );

      return NextResponse.json({
        status: "skipped",
        reason: "no_vendor_in_order_metadata",
        orderId: orderFromWebhook.id,
      });
    }

    const gross =
      snapshot.total?.gross ??
      webhookSnapshot.total?.gross ??
      (() => {
        const g = orderFromWebhook.total?.gross;

        if (!g?.currency || g.amount === undefined || g.amount === null) {
          return null;
        }

        return {
          amount:
            typeof g.amount === "number"
              ? g.amount
              : Number.parseFloat(String(g.amount)),
          currency: String(g.currency),
        };
      })();

    if (!gross?.currency || !Number.isFinite(gross.amount)) {
      marketplaceLogger.warning("[order-paid] skipped: missing total gross", {
        orderId: orderFromWebhook.id,
      });

      return NextResponse.json({
        status: "skipped",
        reason: "no_total_gross",
        orderId: orderFromWebhook.id,
      });
    }

    const metadataForStripe =
      snapshot.metadata.length > 0
        ? snapshot.metadata
        : (orderFromWebhook.metadata ?? []);

    let stripeChargeId =
      findMetadata(metadataForStripe, METADATA_KEYS.STRIPE_CHARGE_ID) ??
      findMetadata(metadataForStripe, "stripe_charge_id");

    if (!stripeChargeId && snapshotFromSaleor) {
      const paymentIntentId =
        pickPaymentIntentIdFromOrderSnapshot(snapshotFromSaleor);

      if (paymentIntentId) {
        try {
          const resolved =
            await getChargeIdFromPaymentIntentId(paymentIntentId);

          if (resolved) {
            stripeChargeId = resolved;
            const metaResult = await executeGraphQL(
              MetadataUpdateDocument,
              "MetadataUpdateMutation",
              {
                id: orderFromWebhook.id,
                input: [
                  {
                    key: METADATA_KEYS.STRIPE_CHARGE_ID,
                    value: resolved,
                  },
                ],
              },
              appConfig.authToken,
            );

            if (!metaResult.ok) {
              marketplaceLogger.warning(
                "[order-paid] stripe_charge_id metadata backfill failed",
                {
                  errors: metaResult.errors,
                  orderId: orderFromWebhook.id,
                },
              );
            }
          }
        } catch (error) {
          marketplaceLogger.warning(
            "[order-paid] could not resolve Stripe charge from PaymentIntent",
            {
              error: error instanceof Error ? error.message : String(error),
              orderId: orderFromWebhook.id,
              paymentIntentId,
            },
          );
        }
      }
    }

    const ledger = await ingestOrderPaidToLedger({
      currency: gross.currency,
      grossAmount: gross.amount,
      occurredAt: occurredAtForLedger,
      orderId: orderFromWebhook.id,
      stripeChargeId,
      vendorId,
    });

    const pool = getLedgerPool();

    if (stripeChargeId && pool) {
      await updateLedgerStripeChargeForOrders(pool, {
        chargeId: stripeChargeId,
        orderIds: [orderFromWebhook.id],
      });

      try {
        await applySettlementForCharge(stripeChargeId);
      } catch (error) {
        marketplaceLogger.warning(
          "[order-paid] Stripe settlement sync failed after charge",
          {
            chargeId: stripeChargeId,
            error: error instanceof Error ? error.message : String(error),
            orderId: orderFromWebhook.id,
          },
        );
      }
    }

    if (ledger.status !== "recorded") {
      marketplaceLogger.warning("[order-paid] ledger ingest skipped", {
        orderId: orderFromWebhook.id,
        reason: ledger.reason,
        vendorId,
      });
    } else {
      marketplaceLogger.info("[order-paid] ledger entry recorded", {
        currency: gross.currency,
        grossAmount: gross.amount,
        orderId: orderFromWebhook.id,
        vendorId,
      });
    }

    return NextResponse.json({
      ledger,
      orderId: orderFromWebhook.id,
      reason: ledger.reason,
      status: ledger.status === "recorded" ? "success" : "skipped",
      vendorId,
    });
  } catch (error) {
    console.error("[order-paid] webhook failed", error);

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
