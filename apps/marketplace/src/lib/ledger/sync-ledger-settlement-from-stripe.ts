import { getLedgerPool } from "@/lib/ledger/pool";
import {
  listDistinctStripeChargeIdsForSync,
  promoteOrderGrossPendingWhenAvailableOnReached,
  updateLedgerSettlementForCharge,
} from "@/lib/ledger/repository";
import {
  retrieveStripeBalanceTransaction,
  retrieveStripeCharge,
} from "@/lib/stripe/payout-api";

export type SyncLedgerStripeSettlementResult =
  | {
      chargeErrors: Array<{ chargeId: string; message: string }>;
      chargeIdsAttempted: number;
      chargesSynced: number;
      ok: true;
      promotedByDateCount: number;
    }
  | { ok: false; reason: "no_database" };

const DEFAULT_CHARGE_LIMIT = 500;

async function settlementFromCharge(chargeId: string): Promise<{
  availableOn: Date | null;
  balanceTransactionId: string | null;
}> {
  const charge = await retrieveStripeCharge(chargeId);
  const bt = charge.balance_transaction;
  let balanceTransactionId: string | null = null;
  let availableOn: Date | null = null;

  if (typeof bt === "string") {
    balanceTransactionId = bt;

    const full = await retrieveStripeBalanceTransaction(bt);

    availableOn = new Date(full.available_on * 1000);
  } else if (bt && typeof bt === "object") {
    const obj = bt as { available_on?: number; id?: string };

    balanceTransactionId =
      typeof obj.id === "string" ? obj.id : balanceTransactionId;

    if (typeof obj.available_on === "number") {
      availableOn = new Date(obj.available_on * 1000);
    }
  }

  return { availableOn, balanceTransactionId };
}

async function updateLedgerSettlementFromStripeCharge(
  chargeId: string,
): Promise<void> {
  const pool = getLedgerPool();

  if (!pool) {
    return;
  }

  const { availableOn, balanceTransactionId } =
    await settlementFromCharge(chargeId);

  await updateLedgerSettlementForCharge(pool, {
    availableOn,
    balanceTransactionId,
    stripeChargeId: chargeId,
  });
}

/**
 * Pull balance transaction for one charge, update ledger, then promote rows past available_on.
 * Call after ORDER_PAID when Stripe charge id is known.
 */
export async function applySettlementForCharge(
  chargeId: string,
): Promise<void> {
  await updateLedgerSettlementFromStripeCharge(chargeId);
  const pool = getLedgerPool();

  if (!pool) {
    return;
  }

  await promoteOrderGrossPendingWhenAvailableOnReached(pool);
}

/**
 * Admin / ops: re-pull Balance Transaction data from Stripe for open ledger lines,
 * then promote any rows whose available_on is already past.
 */
export async function syncLedgerSettlementFromStripe(input?: {
  chargeLimit?: number;
}): Promise<SyncLedgerStripeSettlementResult> {
  const pool = getLedgerPool();

  if (!pool) {
    return { ok: false, reason: "no_database" };
  }

  const limit = input?.chargeLimit ?? DEFAULT_CHARGE_LIMIT;
  const chargeIds = await listDistinctStripeChargeIdsForSync(pool, { limit });
  const chargeErrors: Array<{ chargeId: string; message: string }> = [];
  let chargesSynced = 0;

  for (const chargeId of chargeIds) {
    try {
      await updateLedgerSettlementFromStripeCharge(chargeId);
      chargesSynced += 1;
    } catch (error) {
      chargeErrors.push({
        chargeId,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const promotedByDateCount =
    await promoteOrderGrossPendingWhenAvailableOnReached(pool);

  return {
    chargeErrors,
    chargesSynced,
    chargeIdsAttempted: chargeIds.length,
    ok: true,
    promotedByDateCount,
  };
}
