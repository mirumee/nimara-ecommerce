import { getLedgerDb } from "@/lib/ledger/db/client";
import { closePayoutBatchAndCreateItems } from "@/lib/ledger/repository";

export type ClosePayoutBatchInput = {
  createdBy: string;
  currency: string;
  periodEnd: string;
  periodStart: string;
};

export type ClosePayoutBatchResult =
  | {
      batchId: string;
      itemCount: number;
      ok: true;
    }
  | {
      ok: false;
      reason: "no_database" | "no_eligible_lines";
    };

/**
 * Lock period and insert payout_batch_items from eligible ledger order_gross rows.
 */
export async function closePayoutBatchForPeriod(
  input: ClosePayoutBatchInput,
): Promise<ClosePayoutBatchResult> {
  const db = getLedgerDb();

  if (!db) {
    return { ok: false, reason: "no_database" };
  }

  const cutoff = new Date();
  const created = await closePayoutBatchAndCreateItems(db, {
    createdBy: input.createdBy,
    currency: input.currency,
    cutoff,
    periodEnd: input.periodEnd,
    periodStart: input.periodStart,
  });

  if (created === null) {
    return { ok: false, reason: "no_eligible_lines" };
  }

  return { batchId: created.batchId, itemCount: created.itemCount, ok: true };
}
