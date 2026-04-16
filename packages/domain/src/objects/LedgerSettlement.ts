/**
 * Ledger payout settlement: Stripe funds availability vs transfer eligibility.
 * Aligns with ledger DDL `ledger_funds_status` and `available_on` (BalanceTransaction).
 */

export const LEDGER_FUNDS_STATUSES = [
  "pending_stripe",
  "available",
  "held",
  "reversed",
  "refunded",
] as const;

export type LedgerFundsStatus = (typeof LEDGER_FUNDS_STATUSES)[number];

export type LedgerTransferEligibilityInput = {
  fundsStatus: LedgerFundsStatus;
  /** Stripe BalanceTransaction.available_on (UTC), if known */
  availableOn: Date | null;
};

/**
 * Whether a ledger line may be included in a Connect transfer for `asOf` (e.g. batch lock time).
 * Batch rules may also require `available_on <= cutoff` explicitly in SQL.
 */
export function isLedgerTransferEligible(
  entry: LedgerTransferEligibilityInput,
  asOf: Date,
): boolean {
  if (entry.fundsStatus !== "available") {
    return false;
  }
  if (entry.availableOn !== null && entry.availableOn > asOf) {
    return false;
  }
  return true;
}
