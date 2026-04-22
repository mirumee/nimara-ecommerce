import { getLedgerDb } from "@/lib/ledger/db/client";
import { insertOrderGrossLedgerEntry } from "@/lib/ledger/repository";

/**
 * MVP: assumes 2-decimal fiat; extend for zero-decimal currencies (e.g. JPY) when needed.
 */
export function saleorGrossToMinorUnits(amount: string | number): bigint {
  const n = typeof amount === "number" ? amount : Number.parseFloat(amount);

  if (!Number.isFinite(n)) {
    throw new Error("Invalid order gross amount");
  }

  return BigInt(Math.round(n * 100));
}

export type IngestOrderPaidInput = {
  currency: string;
  grossAmount: string | number;
  occurredAt: Date;
  orderId: string;
  stripeChargeId: string | null;
  vendorId: string;
};

export async function ingestOrderPaidToLedger(
  input: IngestOrderPaidInput,
): Promise<{ reason?: string; status: "recorded" | "skipped" }> {
  const db = getLedgerDb();

  if (!db) {
    return { reason: "DATABASE_URL not configured", status: "skipped" };
  }

  const amountMinor = saleorGrossToMinorUnits(input.grossAmount);

  await insertOrderGrossLedgerEntry(db, {
    amountMinor,
    currency: input.currency,
    occurredAt: input.occurredAt,
    orderId: input.orderId,
    stripeChargeId: input.stripeChargeId,
    vendorId: input.vendorId,
  });

  return { status: "recorded" };
}
