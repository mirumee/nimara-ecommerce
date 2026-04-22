import crypto from "node:crypto";

import { and, desc, eq, gt, inArray, isNull, sql } from "drizzle-orm";

import {
  balanceSnapshots,
  ledgerEntries,
  payoutBatches,
  payoutBatchItems,
  stripeTransfers,
  stripeWebhookEvents,
  vendorStripeAccounts,
} from "@/lib/ledger/db/schema";

import type { LedgerExecutor } from "./db/client";

export type InsertOrderGrossInput = {
  amountMinor: bigint;
  currency: string;
  /** Prefer Saleor order.created; else webhook processing time. */
  occurredAt: Date;
  orderId: string;
  stripeChargeId: string | null;
  vendorId: string;
};

/**
 * Attach Stripe Charge id (ch_…) to ledger rows for these Saleor orders.
 * Idempotent: only fills null stripe_charge_id.
 */
export async function updateLedgerStripeChargeForOrders(
  db: LedgerExecutor,
  input: { chargeId: string; orderIds: string[] },
): Promise<void> {
  if (input.orderIds.length === 0) {
    return;
  }

  await db
    .update(ledgerEntries)
    .set({ stripeChargeId: input.chargeId })
    .where(
      and(
        eq(ledgerEntries.entryType, "order_gross"),
        inArray(ledgerEntries.orderId, input.orderIds),
        isNull(ledgerEntries.stripeChargeId),
      ),
    );
}

/**
 * Insert ORDER_PAID gross line; idempotent on (source_system, source_ref, entry_type).
 */
export async function insertOrderGrossLedgerEntry(
  db: LedgerExecutor,
  input: InsertOrderGrossInput,
): Promise<void> {
  const sourceRef = `order:${input.orderId}:paid:order_gross`;

  await db
    .insert(ledgerEntries)
    .values({
      vendorId: input.vendorId,
      orderId: input.orderId,
      currency: input.currency.toLowerCase(),
      amountMinor: input.amountMinor,
      entryType: "order_gross",
      sourceSystem: "saleor",
      sourceRef,
      stripeChargeId: input.stripeChargeId,
      fundsStatus: "pending_stripe",
      occurredAt: input.occurredAt,
    })
    .onConflictDoNothing({
      target: [
        ledgerEntries.sourceSystem,
        ledgerEntries.sourceRef,
        ledgerEntries.entryType,
      ],
    });
}

export async function tryInsertStripeWebhookEvent(
  db: LedgerExecutor,
  input: {
    eventType: string;
    livemode: boolean;
    payloadJson: unknown;
    payloadRaw: string;
    stripeEventId: string;
  },
): Promise<{ id: string } | null> {
  const payloadSha256 = crypto
    .createHash("sha256")
    .update(input.payloadRaw, "utf8")
    .digest("hex");

  const rows = await db
    .insert(stripeWebhookEvents)
    .values({
      stripeEventId: input.stripeEventId,
      eventType: input.eventType,
      livemode: input.livemode,
      payloadJson: input.payloadJson,
      payloadSha256,
    })
    .onConflictDoNothing({ target: stripeWebhookEvents.stripeEventId })
    .returning({ id: stripeWebhookEvents.id });

  return rows[0] ?? null;
}

export async function markStripeWebhookProcessed(
  db: LedgerExecutor,
  input: { result: string; stripeEventId: string },
): Promise<void> {
  await db
    .update(stripeWebhookEvents)
    .set({
      processedAt: sql`now()`,
      processingResult: input.result,
    })
    .where(eq(stripeWebhookEvents.stripeEventId, input.stripeEventId));
}

export async function updateLedgerSettlementForCharge(
  db: LedgerExecutor,
  input: {
    availableOn: Date | null;
    balanceTransactionId: string | null;
    stripeChargeId: string;
  },
): Promise<void> {
  const availableOnParam = input.availableOn;
  const balanceTxParam = input.balanceTransactionId;

  await db
    .update(ledgerEntries)
    .set({
      availableOn: sql`coalesce(${availableOnParam}::timestamptz, ${ledgerEntries.availableOn})`,
      stripeBalanceTransactionId: sql`coalesce(${balanceTxParam}, ${ledgerEntries.stripeBalanceTransactionId})`,
      fundsStatus: sql`case
        when ${availableOnParam}::timestamptz is not null and ${availableOnParam}::timestamptz <= now() then 'available'::ledger_funds_status
        when ${availableOnParam}::timestamptz is not null then 'pending_stripe'::ledger_funds_status
        else ${ledgerEntries.fundsStatus}
      end`,
    })
    .where(eq(ledgerEntries.stripeChargeId, input.stripeChargeId));
}

/** Unconsumed order_gross lines still tied to a Stripe charge (for admin sync). */
export async function listDistinctStripeChargeIdsForSync(
  db: LedgerExecutor,
  input: { limit: number },
): Promise<string[]> {
  const rows = await db
    .selectDistinct({ stripeChargeId: ledgerEntries.stripeChargeId })
    .from(ledgerEntries)
    .where(
      and(
        eq(ledgerEntries.entryType, "order_gross"),
        sql`${ledgerEntries.stripeChargeId} is not null`,
        isNull(ledgerEntries.consumedInBatchId),
      ),
    )
    .orderBy(ledgerEntries.stripeChargeId)
    .limit(input.limit);

  return rows
    .map((r) => r.stripeChargeId)
    .filter((id): id is string => id !== null);
}

/**
 * Promote pending lines when available_on is already in the past (no extra Stripe call).
 */
export async function promoteOrderGrossPendingWhenAvailableOnReached(
  db: LedgerExecutor,
): Promise<number> {
  const result = await db
    .update(ledgerEntries)
    .set({ fundsStatus: "available" })
    .where(
      and(
        eq(ledgerEntries.entryType, "order_gross"),
        eq(ledgerEntries.fundsStatus, "pending_stripe"),
        sql`${ledgerEntries.availableOn} is not null`,
        sql`${ledgerEntries.availableOn} <= now()`,
      ),
    );

  return result.rowCount ?? 0;
}

export async function insertPlatformBalanceSnapshot(
  db: LedgerExecutor,
  input: {
    availableMinor: bigint;
    currency: string;
    pendingMinor: bigint;
    sourceType: string;
  },
): Promise<void> {
  await db.insert(balanceSnapshots).values({
    accountScope: "platform",
    stripeAccountId: null,
    currency: input.currency.toLowerCase(),
    availableMinor: input.availableMinor,
    pendingMinor: input.pendingMinor,
    sourceType: input.sourceType,
  });
}

const stripeToTransferStatus: Record<
  string,
  "paid" | "created" | "in_transit" | "canceled" | "failed" | "reversed"
> = {
  paid: "paid",
  pending: "created",
  in_transit: "in_transit",
  canceled: "canceled",
  failed: "failed",
  reversed: "reversed",
};

export async function updateStripeTransferRowStatus(
  db: LedgerExecutor,
  input: { stripeStatus: string; stripeTransferId: string },
): Promise<void> {
  const mapped = stripeToTransferStatus[input.stripeStatus] ?? "created";

  await db
    .update(stripeTransfers)
    .set({ status: mapped, updatedAt: sql`now()` })
    .where(eq(stripeTransfers.stripeTransferId, input.stripeTransferId));
}

export type RecentPayoutBatchRow = {
  created_at: Date;
  currency: string;
  executed_at: Date | null;
  id: string;
  period_end: string;
  period_start: string;
  status: string;
  transfer_initiated_at: Date | null;
};

export async function listRecentPayoutBatches(
  db: LedgerExecutor,
  limit: number,
): Promise<RecentPayoutBatchRow[]> {
  const rows = await db
    .select({
      id: payoutBatches.id,
      period_start: payoutBatches.periodStart,
      period_end: payoutBatches.periodEnd,
      currency: payoutBatches.currency,
      status: payoutBatches.status,
      created_at: payoutBatches.createdAt,
      executed_at: payoutBatches.executedAt,
      transfer_initiated_at: sql<Date | string | null>`(
        select min(st.created_at)
        from payout_batch_items pbi
        inner join stripe_transfers st
          on st.payout_batch_item_id = pbi.id
        where pbi.batch_id = payout_batches.id
      )`,
    })
    .from(payoutBatches)
    .orderBy(desc(payoutBatches.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    period_start: String(r.period_start),
    period_end: String(r.period_end),
    currency: r.currency,
    status: r.status,
    created_at: r.created_at,
    executed_at: r.executed_at,
    transfer_initiated_at: coerceNullableDate(r.transfer_initiated_at),
  }));
}

function coerceNullableDate(value: Date | string | null): Date | null {
  if (value === null) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

/**
 * Marks ledger lines as belonging to this batch. Call only from
 * {@link populatePayoutBatchItemsFromLedger} when the batch is created — never from GET / overview /
 * execute, or new lines can be incorrectly tied to old paid batches.
 */
export async function ensureLedgerEntriesConsumedForBatch(
  db: LedgerExecutor,
  batchId: string,
): Promise<void> {
  const batch = await db
    .select({
      currency: payoutBatches.currency,
      lockedAt: payoutBatches.lockedAt,
      periodStart: payoutBatches.periodStart,
      periodEnd: payoutBatches.periodEnd,
      status: payoutBatches.status,
    })
    .from(payoutBatches)
    .where(eq(payoutBatches.id, batchId))
    .limit(1);

  const row = batch[0];

  if (!row || row.status === "canceled") {
    return;
  }

  const batchVendorIds = db
    .select({ vendorId: payoutBatchItems.vendorId })
    .from(payoutBatchItems)
    .where(eq(payoutBatchItems.batchId, batchId));

  await db
    .update(ledgerEntries)
    .set({ consumedInBatchId: batchId })
    .where(
      and(
        isNull(ledgerEntries.consumedInBatchId),
        eq(ledgerEntries.entryType, "order_gross"),
        eq(ledgerEntries.fundsStatus, "available"),
        sql`lower(${ledgerEntries.currency}) = lower(${row.currency})`,
        sql`${ledgerEntries.occurredAt}::date >= ${row.periodStart}::date`,
        sql`${ledgerEntries.occurredAt}::date <= ${row.periodEnd}::date`,
        inArray(ledgerEntries.vendorId, batchVendorIds),
      ),
    );
}

export type PopulatePayoutBatchItemsInput = {
  batchId: string;
  currency: string;
  cutoff: Date;
  periodEnd: string;
  periodStart: string;
};

/**
 * Insert payout_batch_items from eligible ledger rows and mark them consumed.
 * Eligibility: funds_status = 'available' (authoritative), period + currency, not yet consumed.
 *
 * Implemented as `db.execute(sql\`...\`)` because the INSERT ... SELECT with grouped
 * aggregation, left join and CASE expression is substantially less readable when
 * expressed via Drizzle's query builder than in native SQL. The statement is still
 * safe: all user inputs are bound via sql-tag parameter placeholders.
 */
export async function populatePayoutBatchItemsFromLedger(
  db: LedgerExecutor,
  input: PopulatePayoutBatchItemsInput,
): Promise<number> {
  const result = await db.execute(sql`
    insert into payout_batch_items (
      batch_id, vendor_id, stripe_account_id, currency,
      gross_minor, fees_minor, net_minor, ledger_cutoff_ts, status
    )
    select ${input.batchId}::uuid, agg.vendor_id,
      coalesce(v.stripe_account_id, '__unconnected__'),
      lower(${input.currency}::text),
      agg.gross_minor, 0::bigint, agg.gross_minor, ${input.cutoff}::timestamptz,
      case
        when v.vendor_id is null then 'skipped'::payout_item_status
        when v.payouts_enabled then 'ready'::payout_item_status
        else 'skipped'::payout_item_status
      end
    from (
      select vendor_id, sum(amount_minor)::bigint as gross_minor
      from ledger_entries
      where entry_type = 'order_gross'
        and funds_status = 'available'
        and consumed_in_batch_id is null
        and lower(currency) = lower(${input.currency}::text)
        and occurred_at::date >= ${input.periodStart}::date
        and occurred_at::date <= ${input.periodEnd}::date
      group by vendor_id
      having sum(amount_minor) > 0
    ) agg
    left join vendor_stripe_accounts v on v.vendor_id = agg.vendor_id
  `);

  await ensureLedgerEntriesConsumedForBatch(db, input.batchId);

  return result.rowCount ?? 0;
}

export type PayoutBatchWithItems = {
  batch: {
    created_at: Date;
    currency: string;
    executed_at: Date | null;
    id: string;
    period_end: string;
    period_start: string;
    status: string;
  } | null;
  items: Array<{
    fees_minor: string;
    gross_minor: string;
    id: string;
    net_minor: string;
    status: string;
    stripe_transfer_created_at: Date | null;
    vendor_id: string;
  }>;
};

export async function getPayoutBatchWithItems(
  db: LedgerExecutor,
  batchId: string,
): Promise<PayoutBatchWithItems> {
  const batchRows = await db
    .select({
      id: payoutBatches.id,
      period_start: payoutBatches.periodStart,
      period_end: payoutBatches.periodEnd,
      currency: payoutBatches.currency,
      status: payoutBatches.status,
      created_at: payoutBatches.createdAt,
      executed_at: payoutBatches.executedAt,
    })
    .from(payoutBatches)
    .where(eq(payoutBatches.id, batchId))
    .limit(1);

  const batch = batchRows[0];

  if (!batch) {
    return { batch: null, items: [] };
  }

  const itemRows = await db
    .select({
      id: payoutBatchItems.id,
      vendor_id: payoutBatchItems.vendorId,
      gross_minor: payoutBatchItems.grossMinor,
      fees_minor: payoutBatchItems.feesMinor,
      net_minor: payoutBatchItems.netMinor,
      status: payoutBatchItems.status,
      stripe_transfer_created_at: sql<
        Date | string | null
      >`min(${stripeTransfers.createdAt})`,
    })
    .from(payoutBatchItems)
    .leftJoin(
      stripeTransfers,
      eq(stripeTransfers.payoutBatchItemId, payoutBatchItems.id),
    )
    .where(eq(payoutBatchItems.batchId, batchId))
    .groupBy(
      payoutBatchItems.id,
      payoutBatchItems.vendorId,
      payoutBatchItems.grossMinor,
      payoutBatchItems.feesMinor,
      payoutBatchItems.netMinor,
      payoutBatchItems.status,
    )
    .orderBy(payoutBatchItems.vendorId);

  return {
    batch: {
      id: batch.id,
      period_start: String(batch.period_start),
      period_end: String(batch.period_end),
      currency: batch.currency,
      status: batch.status,
      created_at: batch.created_at,
      executed_at: batch.executed_at,
    },
    items: itemRows.map((r) => ({
      id: r.id,
      vendor_id: r.vendor_id,
      gross_minor: r.gross_minor.toString(),
      fees_minor: r.fees_minor.toString(),
      net_minor: r.net_minor.toString(),
      status: r.status,
      stripe_transfer_created_at: coerceNullableDate(
        r.stripe_transfer_created_at,
      ),
    })),
  };
}

export async function getVendorLedgerSummary(
  db: LedgerExecutor,
  vendorId: string,
): Promise<{
  available_minor: bigint;
  currency: string | null;
  pending_minor: bigint;
}> {
  const rows = await db
    .select({
      pending_minor: sql<bigint>`coalesce(sum(case when ${ledgerEntries.fundsStatus} = 'pending_stripe' then ${ledgerEntries.amountMinor} else 0 end), 0)::bigint`,
      available_minor: sql<bigint>`coalesce(sum(case
        when ${ledgerEntries.fundsStatus} = 'available' and ${ledgerEntries.consumedInBatchId} is null then ${ledgerEntries.amountMinor}
        else 0
      end), 0)::bigint`,
      currency: sql<string | null>`max(${ledgerEntries.currency})`,
    })
    .from(ledgerEntries)
    .where(
      and(
        eq(ledgerEntries.vendorId, vendorId),
        eq(ledgerEntries.entryType, "order_gross"),
      ),
    );

  const row = rows[0];

  return {
    available_minor: row?.available_minor ?? 0n,
    currency: row?.currency ?? null,
    pending_minor: row?.pending_minor ?? 0n,
  };
}

export type VendorLedgerLineRow = {
  amount_minor: string;
  available_on: Date | null;
  consumed_in_batch_id: string | null;
  currency: string;
  entry_type: string;
  funds_status: string;
  id: string;
  occurred_at: Date;
  order_id: string | null;
  stripe_charge_id: string | null;
  vendor_id: string;
};

const payoutQueueFundsStatusesSQL = sql`${ledgerEntries.fundsStatus} in ('pending_stripe', 'available', 'held')`;

/** Open batch or batch not yet paid out to vendors (hide rows tied only to a paid batch). */
function payoutQueueConsumptionClauseSQL() {
  return sql`(
    ${ledgerEntries.consumedInBatchId} is null
    or not exists (
      select 1
      from payout_batches pb
      where pb.id = ${ledgerEntries.consumedInBatchId}
        and pb.status = 'paid'
    )
  )`;
}

const payoutQueueOrderSQL = sql`case ${ledgerEntries.fundsStatus}
  when 'available' then 0
  when 'pending_stripe' then 1
  when 'held' then 2
  else 3
end`;

function selectLedgerQueueFields() {
  return {
    id: ledgerEntries.id,
    vendor_id: ledgerEntries.vendorId,
    order_id: ledgerEntries.orderId,
    entry_type: ledgerEntries.entryType,
    amount_minor: ledgerEntries.amountMinor,
    currency: ledgerEntries.currency,
    funds_status: ledgerEntries.fundsStatus,
    available_on: ledgerEntries.availableOn,
    stripe_charge_id: ledgerEntries.stripeChargeId,
    occurred_at: ledgerEntries.occurredAt,
    consumed_in_batch_id: ledgerEntries.consumedInBatchId,
  };
}

function toVendorLedgerLineRow(r: {
  amount_minor: bigint;
  available_on: Date | null;
  consumed_in_batch_id: string | null;
  currency: string;
  entry_type: string;
  funds_status: string;
  id: string;
  occurred_at: Date;
  order_id: string | null;
  stripe_charge_id: string | null;
  vendor_id: string;
}): VendorLedgerLineRow {
  return {
    id: r.id,
    vendor_id: r.vendor_id,
    order_id: r.order_id,
    entry_type: r.entry_type,
    amount_minor: r.amount_minor.toString(),
    currency: r.currency,
    funds_status: r.funds_status,
    available_on: r.available_on,
    stripe_charge_id: r.stripe_charge_id,
    occurred_at: r.occurred_at,
    consumed_in_batch_id: r.consumed_in_batch_id,
  };
}

/**
 * Order gross lines still owed to vendors (pending Stripe, available, held).
 * Excludes refunded/reversed. Includes rows linked to a non-paid batch so
 * pending_stripe lines are not hidden when consumed_in_batch_id was set (e.g. backfill).
 */
export async function listVendorLedgerLines(
  db: LedgerExecutor,
  vendorId: string,
  input: { limit: number },
): Promise<VendorLedgerLineRow[]> {
  const rows = await db
    .select(selectLedgerQueueFields())
    .from(ledgerEntries)
    .where(
      and(
        eq(ledgerEntries.vendorId, vendorId),
        eq(ledgerEntries.entryType, "order_gross"),
        payoutQueueFundsStatusesSQL,
        payoutQueueConsumptionClauseSQL(),
      ),
    )
    .orderBy(payoutQueueOrderSQL, desc(ledgerEntries.occurredAt))
    .limit(input.limit);

  return rows.map(toVendorLedgerLineRow);
}

/** Operator / dashboard: same queue as {@link listVendorLedgerLines} for all vendors. */
export async function listAllLedgerLines(
  db: LedgerExecutor,
  input: { limit: number },
): Promise<VendorLedgerLineRow[]> {
  const rows = await db
    .select(selectLedgerQueueFields())
    .from(ledgerEntries)
    .where(
      and(
        eq(ledgerEntries.entryType, "order_gross"),
        payoutQueueFundsStatusesSQL,
        payoutQueueConsumptionClauseSQL(),
      ),
    )
    .orderBy(payoutQueueOrderSQL, desc(ledgerEntries.occurredAt))
    .limit(input.limit);

  return rows.map(toVendorLedgerLineRow);
}

export async function upsertVendorStripeAccount(
  db: LedgerExecutor,
  input: {
    defaultCurrency: string;
    onboardingCompleted: boolean;
    payoutsEnabled: boolean;
    stripeAccountId: string;
    vendorId: string;
  },
): Promise<void> {
  await db
    .insert(vendorStripeAccounts)
    .values({
      vendorId: input.vendorId,
      stripeAccountId: input.stripeAccountId,
      payoutsEnabled: input.payoutsEnabled,
      onboardingCompleted: input.onboardingCompleted,
      defaultCurrency: input.defaultCurrency.toLowerCase(),
    })
    .onConflictDoUpdate({
      target: vendorStripeAccounts.vendorId,
      set: {
        stripeAccountId: sql`excluded.stripe_account_id`,
        payoutsEnabled: sql`excluded.payouts_enabled`,
        onboardingCompleted: sql`excluded.onboarding_completed`,
        defaultCurrency: sql`excluded.default_currency`,
        updatedAt: sql`now()`,
      },
    });
}

/**
 * Create another payout batch for the same (period, currency) when new eligible lines exist.
 * Only creates a batch when at least one eligible `available` order_gross line exists for the window.
 * Items + consumed_in_batch_id come from the same eligibility rules as {@link populatePayoutBatchItemsFromLedger}.
 */
export async function closePayoutBatchAndCreateItems(
  db: LedgerExecutor,
  input: {
    createdBy: string;
    currency: string;
    cutoff: Date;
    periodEnd: string;
    periodStart: string;
  },
): Promise<{ batchId: string; itemCount: number } | null> {
  // Outer db may itself be a tx (when called by other repo code). Drizzle transactions
  // nest as savepoints, so this is safe either way.
  try {
    return await db.transaction(async (tx) => {
      const eligibleRows = await tx
        .select({
          ok: sql<boolean>`exists (
            select 1
            from ${ledgerEntries}
            where ${ledgerEntries.entryType} = 'order_gross'
              and ${ledgerEntries.fundsStatus} = 'available'
              and ${ledgerEntries.consumedInBatchId} is null
              and lower(${ledgerEntries.currency}) = lower(${input.currency}::text)
              and ${ledgerEntries.occurredAt}::date >= ${input.periodStart}::date
              and ${ledgerEntries.occurredAt}::date <= ${input.periodEnd}::date
          )`,
        })
        .from(sql`(values (1)) as _dummy(x)`);

      if (!eligibleRows[0]?.ok) {
        tx.rollback();
      }

      const inserted = await tx
        .insert(payoutBatches)
        .values({
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          currency: input.currency.toLowerCase(),
          status: "locked",
          lockedAt: input.cutoff,
          createdBy: input.createdBy,
        })
        .returning({ id: payoutBatches.id });

      const batchId = inserted[0]?.id;

      if (!batchId) {
        throw new Error("Failed to create payout batch");
      }

      const itemCount = await populatePayoutBatchItemsFromLedger(tx, {
        batchId,
        currency: input.currency,
        cutoff: input.cutoff,
        periodEnd: input.periodEnd,
        periodStart: input.periodStart,
      });

      if (itemCount === 0) {
        tx.rollback();
      }

      return { batchId, itemCount } as const;
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.constructor.name === "TransactionRollbackError"
    ) {
      return null;
    }
    throw error;
  }
}

export type PayoutBatchItemRow = {
  currency: string;
  destination_account: string;
  id: string;
  net_minor: string;
  status: string;
  vendor_id: string;
};

export async function listPayoutBatchItemsForExecution(
  db: LedgerExecutor,
  batchId: string,
): Promise<PayoutBatchItemRow[]> {
  const rows = await db
    .select({
      id: payoutBatchItems.id,
      vendor_id: payoutBatchItems.vendorId,
      destination_account: payoutBatchItems.stripeAccountId,
      currency: sql<string>`lower(${payoutBatchItems.currency})`,
      net_minor: payoutBatchItems.netMinor,
      status: payoutBatchItems.status,
    })
    .from(payoutBatchItems)
    .where(
      and(
        eq(payoutBatchItems.batchId, batchId),
        eq(payoutBatchItems.status, "ready"),
        gt(payoutBatchItems.netMinor, 0n),
      ),
    )
    .orderBy(payoutBatchItems.vendorId);

  return rows.map((r) => ({
    id: r.id,
    vendor_id: r.vendor_id,
    destination_account: r.destination_account,
    currency: r.currency,
    net_minor: r.net_minor.toString(),
    status: r.status,
  }));
}

export async function insertStripeTransferRecord(
  db: LedgerExecutor,
  input: {
    amountMinor: bigint;
    currency: string;
    destinationAccount: string;
    idempotencyKey: string;
    payoutBatchItemId: string;
    stripeTransferId: string;
    transferGroup: string;
  },
): Promise<void> {
  await db.insert(stripeTransfers).values({
    payoutBatchItemId: input.payoutBatchItemId,
    stripeTransferId: input.stripeTransferId,
    destinationAccount: input.destinationAccount,
    transferGroup: input.transferGroup,
    amountMinor: input.amountMinor,
    currency: input.currency.toLowerCase(),
    idempotencyKey: input.idempotencyKey,
    status: "created",
  });
}

type PayoutItemStatus =
  | "pending"
  | "ready"
  | "processing"
  | "paid"
  | "failed"
  | "reversed"
  | "skipped";

export async function updatePayoutBatchItemStatus(
  db: LedgerExecutor,
  input: {
    failureReason?: string | null;
    itemId: string;
    // Callers pass arbitrary strings from upstream error handling; the enum cast
    // is validated at the DB layer by the enum constraint.
    status: string;
  },
): Promise<void> {
  await db
    .update(payoutBatchItems)
    .set({
      status: input.status as PayoutItemStatus,
      failureReason: input.failureReason ?? null,
    })
    .where(eq(payoutBatchItems.id, input.itemId));
}

type PayoutBatchStatus =
  | "draft"
  | "locked"
  | "executing"
  | "partially_paid"
  | "paid"
  | "failed"
  | "canceled";

export async function setPayoutBatchStatus(
  db: LedgerExecutor,
  input: {
    batchId: string;
    executedAt?: Date | null;
    // Validated at the DB layer by the enum constraint; callers construct
    // values based on item aggregation results.
    status: string;
  },
): Promise<void> {
  const executedAt = input.executedAt ?? null;

  await db
    .update(payoutBatches)
    .set({
      status: input.status as PayoutBatchStatus,
      executedAt: sql`coalesce(${executedAt}::timestamptz, ${payoutBatches.executedAt})`,
    })
    .where(eq(payoutBatches.id, input.batchId));
}

export async function countPayoutBatchItemsByStatus(
  db: LedgerExecutor,
  batchId: string,
): Promise<{ failed: number; paid: number; ready: number; skipped: number }> {
  const rows = await db
    .select({
      failed: sql<string>`coalesce(sum(case when ${payoutBatchItems.status} = 'failed' then 1 else 0 end), 0)::text`,
      paid: sql<string>`coalesce(sum(case when ${payoutBatchItems.status} = 'paid' then 1 else 0 end), 0)::text`,
      ready: sql<string>`coalesce(sum(case when ${payoutBatchItems.status} = 'ready' then 1 else 0 end), 0)::text`,
      skipped: sql<string>`coalesce(sum(case when ${payoutBatchItems.status} = 'skipped' then 1 else 0 end), 0)::text`,
    })
    .from(payoutBatchItems)
    .where(eq(payoutBatchItems.batchId, batchId));

  const row = rows[0];

  return {
    failed: Number(row?.failed ?? 0),
    paid: Number(row?.paid ?? 0),
    ready: Number(row?.ready ?? 0),
    skipped: Number(row?.skipped ?? 0),
  };
}
