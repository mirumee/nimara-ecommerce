import crypto from "node:crypto";

import type { Pool } from "pg";

/** Pool or transaction client — both implement `.query`. */
type LedgerQueryable = Pick<Pool, "query">;

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
 * Insert ORDER_PAID gross line; idempotent on (source_system, source_ref, entry_type).
 */
/**
 * Attach Stripe Charge id (ch_…) to ledger rows for these Saleor orders.
 * Idempotent: only fills null stripe_charge_id.
 */
export async function updateLedgerStripeChargeForOrders(
  pool: Pool,
  input: { chargeId: string; orderIds: string[] },
): Promise<void> {
  if (input.orderIds.length === 0) {
    return;
  }

  await pool.query(
    `update ledger_entries
     set stripe_charge_id = $2
     where entry_type = 'order_gross'
       and order_id = any($1::text[])
       and stripe_charge_id is null`,
    [input.orderIds, input.chargeId],
  );
}

export async function insertOrderGrossLedgerEntry(
  pool: Pool,
  input: InsertOrderGrossInput,
): Promise<void> {
  const sourceRef = `order:${input.orderId}:paid:order_gross`;

  await pool.query(
    `insert into ledger_entries (
      vendor_id, order_id, currency, amount_minor, entry_type, source_system, source_ref,
      stripe_charge_id, funds_status, occurred_at
    ) values ($1, $2, $3, $4, 'order_gross', 'saleor', $5, $6, 'pending_stripe', $7)
    on conflict (source_system, source_ref, entry_type) do nothing`,
    [
      input.vendorId,
      input.orderId,
      input.currency.toLowerCase(),
      input.amountMinor.toString(),
      sourceRef,
      input.stripeChargeId,
      input.occurredAt,
    ],
  );
}

export async function tryInsertStripeWebhookEvent(
  pool: Pool,
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

  const result = await pool.query<{ id: string }>(
    `insert into stripe_webhook_events (
      stripe_event_id, event_type, livemode, payload_json, payload_sha256
    ) values ($1, $2, $3, $4::jsonb, $5)
    on conflict (stripe_event_id) do nothing
    returning id`,
    [
      input.stripeEventId,
      input.eventType,
      input.livemode,
      JSON.stringify(input.payloadJson),
      payloadSha256,
    ],
  );

  return result.rows[0] ?? null;
}

export async function markStripeWebhookProcessed(
  pool: Pool,
  input: { result: string; stripeEventId: string },
): Promise<void> {
  await pool.query(
    `update stripe_webhook_events
     set processed_at = now(), processing_result = $2
     where stripe_event_id = $1`,
    [input.stripeEventId, input.result],
  );
}

export async function updateLedgerSettlementForCharge(
  pool: Pool,
  input: {
    availableOn: Date | null;
    balanceTransactionId: string | null;
    stripeChargeId: string;
  },
): Promise<void> {
  await pool.query(
    `update ledger_entries
     set
       available_on = coalesce($2::timestamptz, available_on),
       stripe_balance_transaction_id = coalesce($3, stripe_balance_transaction_id),
       funds_status = case
         when $2::timestamptz is not null and $2::timestamptz <= now() then 'available'::ledger_funds_status
         when $2::timestamptz is not null then 'pending_stripe'::ledger_funds_status
         else funds_status
       end
     where stripe_charge_id = $1`,
    [input.stripeChargeId, input.availableOn, input.balanceTransactionId],
  );
}

/** Unconsumed order_gross lines still tied to a Stripe charge (for admin sync). */
export async function listDistinctStripeChargeIdsForSync(
  pool: Pool,
  input: { limit: number },
): Promise<string[]> {
  const result = await pool.query<{ stripe_charge_id: string }>(
    `select distinct stripe_charge_id
     from ledger_entries
     where entry_type = 'order_gross'
       and stripe_charge_id is not null
       and consumed_in_batch_id is null
     order by stripe_charge_id
     limit $1`,
    [input.limit],
  );

  return result.rows.map((r) => r.stripe_charge_id);
}

/**
 * Promote pending lines when available_on is already in the past (no extra Stripe call).
 */
export async function promoteOrderGrossPendingWhenAvailableOnReached(
  pool: Pool,
): Promise<number> {
  const result = await pool.query(
    `update ledger_entries
     set funds_status = 'available'::ledger_funds_status
     where entry_type = 'order_gross'
       and funds_status = 'pending_stripe'
       and available_on is not null
       and available_on <= now()`,
  );

  return result.rowCount ?? 0;
}

export async function insertPlatformBalanceSnapshot(
  pool: Pool,
  input: {
    availableMinor: bigint;
    currency: string;
    pendingMinor: bigint;
    sourceType: string;
  },
): Promise<void> {
  await pool.query(
    `insert into balance_snapshots (
      account_scope, stripe_account_id, currency, available_minor, pending_minor, source_type
    ) values ('platform', null, $1, $2, $3, $4)`,
    [
      input.currency.toLowerCase(),
      input.availableMinor.toString(),
      input.pendingMinor.toString(),
      input.sourceType,
    ],
  );
}

const stripeToTransferStatus: Record<string, string> = {
  paid: "paid",
  pending: "created",
  in_transit: "in_transit",
  canceled: "canceled",
  failed: "failed",
  reversed: "reversed",
};

export async function updateStripeTransferRowStatus(
  pool: Pool,
  input: { stripeStatus: string; stripeTransferId: string },
): Promise<void> {
  const mapped = stripeToTransferStatus[input.stripeStatus] ?? "created";

  await pool.query(
    `update stripe_transfers
     set status = $1::stripe_transfer_status, updated_at = now()
     where stripe_transfer_id = $2`,
    [mapped, input.stripeTransferId],
  );
}

export async function listRecentPayoutBatches(
  pool: Pool,
  limit: number,
): Promise<
  Array<{
    created_at: Date;
    currency: string;
    executed_at: Date | null;
    id: string;
    period_end: string;
    period_start: string;
    status: string;
    transfer_initiated_at: Date | null;
  }>
> {
  const result = await pool.query<{
    created_at: Date;
    currency: string;
    executed_at: Date | null;
    id: string;
    period_end: string;
    period_start: string;
    status: string;
    transfer_initiated_at: Date | null;
  }>(
    `select
       pb.id::text as id,
       to_char(pb.period_start, 'YYYY-MM-DD') as period_start,
       to_char(pb.period_end, 'YYYY-MM-DD') as period_end,
       pb.currency,
       pb.status::text as status,
       pb.created_at,
       pb.executed_at,
       ti.first_transfer_at as transfer_initiated_at
     from payout_batches pb
     left join lateral (
       select min(st.created_at) as first_transfer_at
       from payout_batch_items pbi
       inner join stripe_transfers st on st.payout_batch_item_id = pbi.id
       where pbi.batch_id = pb.id
     ) ti on true
     order by pb.created_at desc
     limit $1`,
    [limit],
  );

  return result.rows;
}

/**
 * Marks ledger lines as belonging to this batch. Call only from
 * {@link populatePayoutBatchItemsFromLedger} when the batch is created — never from GET / overview /
 * execute, or new lines can be incorrectly tied to old paid batches.
 */
export async function ensureLedgerEntriesConsumedForBatch(
  db: LedgerQueryable,
  batchId: string,
): Promise<void> {
  const batchResult = await db.query<{
    currency: string;
    locked_at: Date | null;
    period_end: Date | string;
    period_start: Date | string;
    status: string;
  }>(
    `select currency, locked_at, period_start, period_end, status::text as status
     from payout_batches where id = $1::uuid`,
    [batchId],
  );

  const batch = batchResult.rows[0];

  if (!batch || batch.status === "canceled") {
    return;
  }

  await db.query(
    `update ledger_entries le
     set consumed_in_batch_id = $1::uuid
     where le.consumed_in_batch_id is null
       and le.entry_type = 'order_gross'
       and le.funds_status = 'available'
       and lower(le.currency) = lower($2::text)
       and le.occurred_at::date >= $3::date
       and le.occurred_at::date <= $4::date
       and le.vendor_id in (
         select vendor_id from payout_batch_items where batch_id = $1::uuid
       )`,
    [batchId, batch.currency, batch.period_start, batch.period_end],
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
 */
export async function populatePayoutBatchItemsFromLedger(
  db: LedgerQueryable,
  input: PopulatePayoutBatchItemsInput,
): Promise<number> {
  const insertItems = await db.query(
    `insert into payout_batch_items (
        batch_id, vendor_id, stripe_account_id, currency,
        gross_minor, fees_minor, net_minor, ledger_cutoff_ts, status
      )
      select $1::uuid, agg.vendor_id,
        coalesce(v.stripe_account_id, '__unconnected__'),
        lower($2::text),
        agg.gross_minor, 0::bigint, agg.gross_minor, $3::timestamptz,
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
          and lower(currency) = lower($2::text)
          and occurred_at::date >= $4::date
          and occurred_at::date <= $5::date
        group by vendor_id
        having sum(amount_minor) > 0
      ) agg
      left join vendor_stripe_accounts v on v.vendor_id = agg.vendor_id`,
    [
      input.batchId,
      input.currency,
      input.cutoff,
      input.periodStart,
      input.periodEnd,
    ],
  );

  await ensureLedgerEntriesConsumedForBatch(db, input.batchId);

  return insertItems.rowCount ?? 0;
}

export async function getPayoutBatchWithItems(
  pool: Pool,
  batchId: string,
): Promise<{
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
}> {
  const batchResult = await pool.query<{
    created_at: Date;
    currency: string;
    executed_at: Date | null;
    id: string;
    period_end: string;
    period_start: string;
    status: string;
  }>(
    `select id::text,
       to_char(period_start, 'YYYY-MM-DD') as period_start,
       to_char(period_end, 'YYYY-MM-DD') as period_end,
       currency,
       status::text as status,
       created_at,
       executed_at
     from payout_batches where id = $1::uuid`,
    [batchId],
  );

  const batch = batchResult.rows[0] ?? null;

  if (!batch) {
    return { batch: null, items: [] };
  }

  const itemsResult = await pool.query<{
    fees_minor: string;
    gross_minor: string;
    id: string;
    net_minor: string;
    status: string;
    stripe_transfer_created_at: Date | null;
    vendor_id: string;
  }>(
    `select pbi.id::text as id,
       pbi.vendor_id,
       pbi.gross_minor::text,
       pbi.fees_minor::text,
       pbi.net_minor::text,
       pbi.status::text as status,
       min(st.created_at) as stripe_transfer_created_at
     from payout_batch_items pbi
     left join stripe_transfers st on st.payout_batch_item_id = pbi.id
     where pbi.batch_id = $1::uuid
     group by pbi.id, pbi.vendor_id, pbi.gross_minor, pbi.fees_minor, pbi.net_minor, pbi.status
     order by pbi.vendor_id`,
    [batchId],
  );

  return { batch, items: itemsResult.rows };
}

export async function getVendorLedgerSummary(
  pool: Pool,
  vendorId: string,
): Promise<{
  available_minor: bigint;
  currency: string | null;
  pending_minor: bigint;
}> {
  const result = await pool.query<{
    available_minor: string | null;
    currency: string | null;
    pending_minor: string | null;
  }>(
    `select
       coalesce(sum(case when funds_status = 'pending_stripe' then amount_minor else 0 end), 0)::text as pending_minor,
       coalesce(sum(case
         when funds_status = 'available' and consumed_in_batch_id is null then amount_minor
         else 0
       end), 0)::text as available_minor,
       max(currency) as currency
     from ledger_entries
     where vendor_id = $1 and entry_type = 'order_gross'`,
    [vendorId],
  );

  const row = result.rows[0];

  return {
    available_minor: BigInt(String(row?.available_minor ?? "0")),
    currency: row?.currency ?? null,
    pending_minor: BigInt(String(row?.pending_minor ?? "0")),
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

const payoutQueueFundsStatuses = `le.funds_status::text in ('pending_stripe', 'available', 'held')`;

/** Open batch or batch not yet paid out to vendors (hide rows tied only to a paid batch). */
const payoutQueueConsumptionClause = `(
       le.consumed_in_batch_id is null
       or not exists (
         select 1
         from payout_batches pb
         where pb.id = le.consumed_in_batch_id
           and pb.status::text = 'paid'
       )
     )`;

/**
 * Order gross lines still owed to vendors (pending Stripe, available, held).
 * Excludes refunded/reversed. Includes rows linked to a non-paid batch so
 * pending_stripe lines are not hidden when consumed_in_batch_id was set (e.g. backfill).
 */
export async function listVendorLedgerLines(
  pool: Pool,
  vendorId: string,
  input: { limit: number },
): Promise<VendorLedgerLineRow[]> {
  const result = await pool.query<{
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
  }>(
    `select le.id::text,
       le.vendor_id,
       le.order_id,
       le.entry_type::text as entry_type,
       le.amount_minor::text,
       le.currency,
       le.funds_status::text as funds_status,
       le.available_on,
       le.stripe_charge_id,
       le.occurred_at,
       le.consumed_in_batch_id::text as consumed_in_batch_id
     from ledger_entries le
     where le.vendor_id = $1
       and le.entry_type = 'order_gross'
       and ${payoutQueueFundsStatuses}
       and ${payoutQueueConsumptionClause}
     order by
       case le.funds_status::text
         when 'available' then 0
         when 'pending_stripe' then 1
         when 'held' then 2
         else 3
       end,
       le.occurred_at desc
     limit $2`,
    [vendorId, input.limit],
  );

  return result.rows;
}

/** Operator / dashboard: same queue as {@link listVendorLedgerLines} for all vendors. */
export async function listAllLedgerLines(
  pool: Pool,
  input: { limit: number },
): Promise<VendorLedgerLineRow[]> {
  const result = await pool.query<{
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
  }>(
    `select le.id::text,
       le.vendor_id,
       le.order_id,
       le.entry_type::text as entry_type,
       le.amount_minor::text,
       le.currency,
       le.funds_status::text as funds_status,
       le.available_on,
       le.stripe_charge_id,
       le.occurred_at,
       le.consumed_in_batch_id::text as consumed_in_batch_id
     from ledger_entries le
     where le.entry_type = 'order_gross'
       and ${payoutQueueFundsStatuses}
       and ${payoutQueueConsumptionClause}
     order by
       case le.funds_status::text
         when 'available' then 0
         when 'pending_stripe' then 1
         when 'held' then 2
         else 3
       end,
       le.occurred_at desc
     limit $1`,
    [input.limit],
  );

  return result.rows;
}

export async function upsertVendorStripeAccount(
  pool: Pool,
  input: {
    defaultCurrency: string;
    onboardingCompleted: boolean;
    payoutsEnabled: boolean;
    stripeAccountId: string;
    vendorId: string;
  },
): Promise<void> {
  await pool.query(
    `insert into vendor_stripe_accounts (
      vendor_id, stripe_account_id, payouts_enabled, onboarding_completed, default_currency
    ) values ($1, $2, $3, $4, lower($5))
    on conflict (vendor_id) do update set
      stripe_account_id = excluded.stripe_account_id,
      payouts_enabled = excluded.payouts_enabled,
      onboarding_completed = excluded.onboarding_completed,
      default_currency = excluded.default_currency,
      updated_at = now()`,
    [
      input.vendorId,
      input.stripeAccountId,
      input.payoutsEnabled,
      input.onboardingCompleted,
      input.defaultCurrency,
    ],
  );
}

/**
 * Create another payout batch for the same (period, currency) when new eligible lines exist.
 * Only creates a batch when at least one eligible `available` order_gross line exists for the window.
 * Items + consumed_in_batch_id come from the same eligibility rules as {@link populatePayoutBatchItemsFromLedger}.
 */
export async function closePayoutBatchAndCreateItems(
  pool: Pool,
  input: {
    createdBy: string;
    currency: string;
    cutoff: Date;
    periodEnd: string;
    periodStart: string;
  },
): Promise<{ batchId: string; itemCount: number } | null> {
  const client = await pool.connect();

  try {
    await client.query("begin");

    const eligible = await client.query<{ ok: boolean }>(
      `select exists (
         select 1
         from ledger_entries
         where entry_type = 'order_gross'
           and funds_status = 'available'
           and consumed_in_batch_id is null
           and lower(currency) = lower($1::text)
           and occurred_at::date >= $2::date
           and occurred_at::date <= $3::date
       ) as ok`,
      [input.currency, input.periodStart, input.periodEnd],
    );

    if (!eligible.rows[0]?.ok) {
      await client.query("rollback");

      return null;
    }

    const batchResult = await client.query<{ id: string }>(
      `insert into payout_batches (
        period_start, period_end, currency, status, locked_at, created_by
      ) values ($1::date, $2::date, lower($3), 'locked', $4::timestamptz, $5)
      returning id`,
      [
        input.periodStart,
        input.periodEnd,
        input.currency,
        input.cutoff,
        input.createdBy,
      ],
    );

    const batchId = batchResult.rows[0]?.id;

    if (!batchId) {
      throw new Error("Failed to create payout batch");
    }

    const itemCount = await populatePayoutBatchItemsFromLedger(client, {
      batchId,
      currency: input.currency,
      cutoff: input.cutoff,
      periodEnd: input.periodEnd,
      periodStart: input.periodStart,
    });

    if (itemCount === 0) {
      await client.query("rollback");

      return null;
    }

    await client.query("commit");

    return { batchId, itemCount };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
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
  pool: Pool,
  batchId: string,
): Promise<PayoutBatchItemRow[]> {
  const result = await pool.query<PayoutBatchItemRow>(
    `select
       pbi.id,
       pbi.vendor_id,
       pbi.stripe_account_id as destination_account,
       lower(pbi.currency) as currency,
       pbi.net_minor::text as net_minor,
       pbi.status::text as status
     from payout_batch_items pbi
     where pbi.batch_id = $1::uuid
       and pbi.status = 'ready'
       and pbi.net_minor > 0
     order by pbi.vendor_id`,
    [batchId],
  );

  return result.rows;
}

export async function insertStripeTransferRecord(
  pool: Pool,
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
  await pool.query(
    `insert into stripe_transfers (
      payout_batch_item_id, stripe_transfer_id, destination_account,
      transfer_group, amount_minor, currency, idempotency_key, status
    ) values ($1::uuid, $2, $3, $4, $5, lower($6), $7, 'created')`,
    [
      input.payoutBatchItemId,
      input.stripeTransferId,
      input.destinationAccount,
      input.transferGroup,
      input.amountMinor.toString(),
      input.currency,
      input.idempotencyKey,
    ],
  );
}

export async function updatePayoutBatchItemStatus(
  pool: Pool,
  input: {
    failureReason?: string | null;
    itemId: string;
    status: string;
  },
): Promise<void> {
  await pool.query(
    `update payout_batch_items
     set status = $2::payout_item_status,
         failure_reason = $3
     where id = $1::uuid`,
    [input.itemId, input.status, input.failureReason ?? null],
  );
}

export async function setPayoutBatchStatus(
  pool: Pool,
  input: {
    batchId: string;
    executedAt?: Date | null;
    status: string;
  },
): Promise<void> {
  await pool.query(
    `update payout_batches
     set status = $2::payout_batch_status,
         executed_at = coalesce($3::timestamptz, executed_at)
     where id = $1::uuid`,
    [input.batchId, input.status, input.executedAt ?? null],
  );
}

export async function countPayoutBatchItemsByStatus(
  pool: Pool,
  batchId: string,
): Promise<{ failed: number; paid: number; ready: number; skipped: number }> {
  const result = await pool.query<{
    failed: string;
    paid: string;
    ready: string;
    skipped: string;
  }>(
    `select
       coalesce(sum(case when status = 'failed' then 1 else 0 end), 0)::text as failed,
       coalesce(sum(case when status = 'paid' then 1 else 0 end), 0)::text as paid,
       coalesce(sum(case when status = 'ready' then 1 else 0 end), 0)::text as ready,
       coalesce(sum(case when status = 'skipped' then 1 else 0 end), 0)::text as skipped
     from payout_batch_items
     where batch_id = $1::uuid`,
    [batchId],
  );

  const row = result.rows[0];

  return {
    failed: Number(row?.failed ?? 0),
    paid: Number(row?.paid ?? 0),
    ready: Number(row?.ready ?? 0),
    skipped: Number(row?.skipped ?? 0),
  };
}
