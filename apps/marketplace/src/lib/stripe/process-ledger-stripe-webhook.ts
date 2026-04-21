import type { Pool } from "pg";

import {
  insertPlatformBalanceSnapshot,
  markStripeWebhookProcessed,
  tryInsertStripeWebhookEvent,
  updateLedgerSettlementForCharge,
  updateStripeTransferRowStatus,
} from "@/lib/ledger/repository";
import {
  getStripePlatformBalance,
  retrieveStripeBalanceTransaction,
} from "@/lib/stripe/payout-api";

export type StripeWebhookEventEnvelope = {
  data?: { object?: Record<string, unknown> };
  id: string;
  livemode: boolean;
  type: string;
};

const LEDGER_EVENT_TYPES = new Set([
  "charge.succeeded",
  "balance.available",
  "transfer.created",
  "transfer.updated",
  "transfer.reversed",
]);

export function isLedgerStripeEventType(type: string): boolean {
  return LEDGER_EVENT_TYPES.has(type);
}

export async function tryRecordStripeWebhookInbox(
  pool: Pool,
  payloadRaw: string,
  event: StripeWebhookEventEnvelope,
): Promise<boolean> {
  let payloadJson: unknown;

  try {
    payloadJson = JSON.parse(payloadRaw) as unknown;
  } catch {
    payloadJson = { parseError: true };
  }

  const row = await tryInsertStripeWebhookEvent(pool, {
    eventType: event.type,
    livemode: event.livemode,
    payloadJson,
    payloadRaw,
    stripeEventId: event.id,
  });

  return row !== null;
}

export async function processLedgerStripeSideEffects(
  pool: Pool,
  event: StripeWebhookEventEnvelope,
): Promise<void> {
  switch (event.type) {
    case "charge.succeeded":
      await handleChargeSucceeded(pool, event.data?.object);
      break;
    case "balance.available":
      await handleBalanceAvailable(pool);
      break;
    case "transfer.created":
    case "transfer.updated":
    case "transfer.reversed":
      await handleTransferEvent(pool, event.data?.object);
      break;
    default:
      break;
  }
}

async function handleChargeSucceeded(
  pool: Pool,
  charge: Record<string, unknown> | undefined,
): Promise<void> {
  if (!charge?.id || typeof charge.id !== "string") {
    return;
  }

  const chargeId = charge.id;
  let balanceTransactionId: string | null = null;
  let availableOn: Date | null = null;

  const bt = charge.balance_transaction;

  if (typeof bt === "string") {
    balanceTransactionId = bt;

    try {
      const full = await retrieveStripeBalanceTransaction(bt);

      availableOn = new Date(full.available_on * 1000);
    } catch (error) {
      console.error("[ledger] balance transaction fetch failed", error);
    }
  } else if (bt && typeof bt === "object") {
    const obj = bt as { available_on?: number; id?: string };

    balanceTransactionId =
      typeof obj.id === "string" ? obj.id : balanceTransactionId;

    if (typeof obj.available_on === "number") {
      availableOn = new Date(obj.available_on * 1000);
    }
  }

  await updateLedgerSettlementForCharge(pool, {
    availableOn,
    balanceTransactionId,
    stripeChargeId: chargeId,
  });
}

async function handleBalanceAvailable(pool: Pool): Promise<void> {
  const bal = await getStripePlatformBalance();
  const currencies = new Set<string>();

  for (const row of bal.available) {
    currencies.add(row.currency.toLowerCase());
  }

  for (const row of bal.pending) {
    currencies.add(row.currency.toLowerCase());
  }

  for (const currency of currencies) {
    const availableMinor = BigInt(
      bal.available
        .filter((r) => r.currency.toLowerCase() === currency)
        .reduce((sum, r) => sum + r.amount, 0),
    );
    const pendingMinor = BigInt(
      bal.pending
        .filter((r) => r.currency.toLowerCase() === currency)
        .reduce((sum, r) => sum + r.amount, 0),
    );

    await insertPlatformBalanceSnapshot(pool, {
      availableMinor,
      currency,
      pendingMinor,
      sourceType: "balance.available",
    });
  }
}

async function handleTransferEvent(
  pool: Pool,
  obj: Record<string, unknown> | undefined,
): Promise<void> {
  const id = typeof obj?.id === "string" ? obj.id : null;
  const status = typeof obj?.status === "string" ? obj.status : null;

  if (!id || !status) {
    return;
  }

  await updateStripeTransferRowStatus(pool, {
    stripeStatus: status,
    stripeTransferId: id,
  });
}

export async function finalizeStripeWebhookInbox(
  pool: Pool,
  eventId: string,
  result: string,
): Promise<void> {
  await markStripeWebhookProcessed(pool, {
    result,
    stripeEventId: eventId,
  });
}
