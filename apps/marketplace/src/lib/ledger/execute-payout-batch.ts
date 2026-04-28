import { sql } from "drizzle-orm";

import { getLedgerDb } from "@/lib/ledger/db/client";
import { payoutBatches } from "@/lib/ledger/db/schema";
import {
  countPayoutBatchItemsByStatus,
  insertStripeTransferRecord,
  listPayoutBatchItemsForExecution,
  setPayoutBatchStatus,
  updatePayoutBatchItemStatus,
} from "@/lib/ledger/repository";
import { createStripeConnectTransfer } from "@/lib/stripe/payout-api";

export type ExecutePayoutBatchResult = {
  batchStatus: string;
  errors: Array<{ itemId: string; message: string }>;
  processed: number;
};

/**
 * Create Stripe transfers for each batch item in `ready` status with net_minor > 0.
 */
export async function executePayoutBatchTransfers(
  batchId: string,
): Promise<ExecutePayoutBatchResult> {
  const db = getLedgerDb();

  if (!db) {
    throw new Error("Ledger database not configured");
  }

  const batchRow = await db
    .select({ status: sql<string>`${payoutBatches.status}::text` })
    .from(payoutBatches)
    .where(sql`${payoutBatches.id} = ${batchId}::uuid`)
    .limit(1);

  const batchStatus = batchRow[0]?.status;

  if (
    batchStatus !== "locked" &&
    batchStatus !== "partially_paid" &&
    batchStatus !== "executing"
  ) {
    throw new Error(
      `Batch must be locked or partially_paid before execution (got ${batchStatus ?? "unknown"})`,
    );
  }

  await setPayoutBatchStatus(db, { batchId, status: "executing" });

  const items = await listPayoutBatchItemsForExecution(db, batchId);

  if (items.length === 0) {
    await setPayoutBatchStatus(db, {
      batchId,
      executedAt: new Date(),
      status: "paid",
    });

    return { batchStatus: "paid", errors: [], processed: 0 };
  }

  const errors: Array<{ itemId: string; message: string }> = [];
  let processed = 0;

  for (const item of items) {
    const netMinor = BigInt(item.net_minor);

    if (netMinor <= 0n) {
      continue;
    }

    const idempotencyKey = `payout:${batchId}:item:${item.id}`;

    try {
      const transfer = await createStripeConnectTransfer({
        amountMinor: Number(netMinor),
        currency: item.currency,
        destinationAccountId: item.destination_account,
        idempotencyKey,
        metadata: {
          batch_id: batchId,
          vendor_id: item.vendor_id,
        },
        transferGroup: `payout:${batchId}`,
      });

      await insertStripeTransferRecord(db, {
        amountMinor: netMinor,
        currency: item.currency,
        destinationAccount: item.destination_account,
        idempotencyKey,
        payoutBatchItemId: item.id,
        stripeTransferId: transfer.id,
        transferGroup: `payout:${batchId}`,
      });
      await updatePayoutBatchItemStatus(db, {
        itemId: item.id,
        status: "paid",
      });
      processed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      errors.push({ itemId: item.id, message });
      await updatePayoutBatchItemStatus(db, {
        failureReason: message,
        itemId: item.id,
        status: "failed",
      });
    }
  }

  const counts = await countPayoutBatchItemsByStatus(db, batchId);
  let finalBatchStatus = "paid";

  if (counts.failed > 0) {
    finalBatchStatus = counts.paid > 0 ? "partially_paid" : "failed";
  } else if (counts.ready > 0) {
    finalBatchStatus = "executing";
  }

  await setPayoutBatchStatus(db, {
    batchId,
    executedAt: new Date(),
    status: finalBatchStatus,
  });

  return {
    batchStatus: finalBatchStatus,
    errors,
    processed,
  };
}
