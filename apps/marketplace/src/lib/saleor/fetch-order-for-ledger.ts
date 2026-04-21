import { METADATA_KEYS } from "@/lib/saleor/consts";
import { marketplaceLogger } from "@/services/logging";

export type OrderLedgerSnapshot = {
  /** ISO 8601 from Saleor order.created */
  created?: string | null;
  lines: Array<{
    variant?: {
      product?: { metadata?: Array<{ key: string; value: string }> } | null;
    } | null;
  }>;
  metadata: Array<{ key: string; value: string }>;
  total: {
    gross: { amount: number; currency: string };
  } | null;
  transactions?: Array<{
    chargedAmount: { amount: number } | null;
    pspReference: string | null;
  }>;
};

function findMeta(
  metadata: Array<{ key: string; value: string }> | undefined,
  key: string,
): string | null {
  const item = metadata?.find((m) => m.key === key);

  return item?.value?.trim() || null;
}

/**
 * Same vendor resolution as order-created: order metadata, then first line product metadata.
 */
export function resolveVendorIdFromOrderSnapshot(
  order: OrderLedgerSnapshot,
): string | null {
  const fromOrder =
    findMeta(order.metadata, METADATA_KEYS.VENDOR_ID) ??
    findMeta(order.metadata, "vendor_id");

  if (fromOrder) {
    return fromOrder;
  }

  for (const line of order.lines) {
    const productMeta = line.variant?.product?.metadata;

    if (!productMeta?.length) {
      continue;
    }

    const vid =
      findMeta(productMeta, METADATA_KEYS.VENDOR_ID) ??
      findMeta(productMeta, "vendor_id");

    if (vid) {
      return vid;
    }
  }

  return null;
}

/** First Saleor transaction whose PSP reference is a Stripe PaymentIntent id. */
export function pickPaymentIntentIdFromOrderSnapshot(
  snapshot: OrderLedgerSnapshot,
): string | null {
  const txs = snapshot.transactions;

  if (!txs?.length) {
    return null;
  }

  let fallbackPi: string | null = null;

  for (const t of txs) {
    const ref = t.pspReference?.trim();

    if (!ref?.startsWith("pi_")) {
      continue;
    }

    if ((t.chargedAmount?.amount ?? 0) > 0) {
      return ref;
    }

    if (!fallbackPi) {
      fallbackPi = ref;
    }
  }

  return fallbackPi;
}

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

/**
 * Load current order from Saleor (avoids race: ORDER_PAID payload before ORDER_CREATED metadata update).
 */
export async function fetchOrderSnapshotForLedger(input: {
  authToken: string;
  orderId: string;
  saleorDomain: string;
}): Promise<OrderLedgerSnapshot | null> {
  const query = `
    query OrderLedgerSnapshot($id: ID!) {
      order(id: $id) {
        created
        metadata {
          key
          value
        }
        total {
          gross {
            amount
            currency
          }
        }
        lines {
          variant {
            product {
              metadata {
                key
                value
              }
            }
          }
        }
        transactions {
          pspReference
          chargedAmount {
            amount
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${input.saleorDomain}/graphql/`, {
    body: JSON.stringify({ query, variables: { id: input.orderId } }),
    headers: {
      Authorization: `Bearer ${input.authToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const json = (await response.json()) as GraphQLResponse<{
    order?: OrderLedgerSnapshot | null;
  }>;

  if (!response.ok || json.errors?.length) {
    marketplaceLogger.warning(
      "[order-paid] Saleor order snapshot fetch failed",
      {
        errors: json.errors?.map((e) => e.message),
        httpStatus: response.status,
        orderId: input.orderId,
      },
    );

    return null;
  }

  const order = json.data?.order;

  if (!order) {
    marketplaceLogger.warning(
      "[order-paid] Saleor order snapshot missing order node",
      {
        orderId: input.orderId,
      },
    );

    return null;
  }

  return {
    created: order.created != null ? String(order.created) : null,
    lines: order.lines ?? [],
    metadata: order.metadata ?? [],
    total: order.total?.gross
      ? {
          gross: {
            amount: Number(order.total.gross.amount),
            currency: String(order.total.gross.currency),
          },
        }
      : null,
    transactions: (order.transactions ?? []).map(
      (t: {
        chargedAmount?: { amount?: unknown } | null;
        pspReference?: string | null;
      }) => ({
        pspReference: t.pspReference ?? null,
        chargedAmount:
          t.chargedAmount?.amount != null
            ? { amount: Number(t.chargedAmount.amount) }
            : null,
      }),
    ),
  };
}
