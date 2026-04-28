import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const ledgerEntryType = pgEnum("ledger_entry_type", [
  "order_gross",
  "platform_fee",
  "stripe_fee",
  "refund",
  "adjustment",
  "transfer_out",
  "transfer_reversal",
]);

export const ledgerFundsStatus = pgEnum("ledger_funds_status", [
  "pending_stripe",
  "available",
  "held",
  "reversed",
  "refunded",
]);

export const payoutBatchStatus = pgEnum("payout_batch_status", [
  "draft",
  "locked",
  "executing",
  "partially_paid",
  "paid",
  "failed",
  "canceled",
]);

export const payoutItemStatus = pgEnum("payout_item_status", [
  "pending",
  "ready",
  "processing",
  "paid",
  "failed",
  "reversed",
  "skipped",
]);

export const stripeTransferStatus = pgEnum("stripe_transfer_status", [
  "created",
  "in_transit",
  "paid",
  "failed",
  "reversed",
  "canceled",
]);

export const vendorStripeAccounts = pgTable("vendor_stripe_accounts", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: text().notNull().unique(),
  stripeAccountId: text().notNull().unique(),
  payoutsEnabled: boolean().notNull().default(false),
  onboardingCompleted: boolean().notNull().default(false),
  defaultCurrency: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const payoutBatches = pgTable("payout_batches", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  periodStart: date().notNull(),
  periodEnd: date().notNull(),
  currency: text().notNull(),
  status: payoutBatchStatus().notNull().default("draft"),
  lockedAt: timestamp({ withTimezone: true }),
  executedAt: timestamp({ withTimezone: true }),
  createdBy: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const payoutBatchItems = pgTable(
  "payout_batch_items",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    batchId: uuid()
      .notNull()
      .references(() => payoutBatches.id),
    vendorId: text().notNull(),
    stripeAccountId: text().notNull(),
    currency: text().notNull(),
    grossMinor: bigint({ mode: "bigint" }).notNull(),
    feesMinor: bigint({ mode: "bigint" }).notNull(),
    netMinor: bigint({ mode: "bigint" }).notNull(),
    ledgerCutoffTs: timestamp({ withTimezone: true }).notNull(),
    status: payoutItemStatus().notNull().default("pending"),
    failureReason: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("payout_batch_items_batch_id_vendor_id_key").on(
      t.batchId,
      t.vendorId,
    ),
    index("ix_batch_items_status").on(t.status),
  ],
);

export const stripeTransfers = pgTable(
  "stripe_transfers",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    payoutBatchItemId: uuid()
      .notNull()
      .references(() => payoutBatchItems.id),
    stripeTransferId: text().notNull().unique(),
    destinationAccount: text().notNull(),
    transferGroup: text().notNull(),
    amountMinor: bigint({ mode: "bigint" }).notNull(),
    currency: text().notNull(),
    idempotencyKey: text().notNull().unique(),
    status: stripeTransferStatus().notNull().default("created"),
    amountReversedMinor: bigint({ mode: "bigint" })
      .notNull()
      .default(sql`0`),
    stripeBalanceTransactionId: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ix_transfers_status").on(t.status)],
);

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    vendorId: text().notNull(),
    orderId: text(),
    currency: text().notNull(),
    amountMinor: bigint({ mode: "bigint" }).notNull(),
    entryType: ledgerEntryType().notNull(),
    sourceSystem: text().notNull(),
    sourceRef: text().notNull(),
    transferGroup: text(),
    stripeChargeId: text(),
    stripeBalanceTransactionId: text(),
    stripeTransferId: text(),
    availableOn: timestamp({ withTimezone: true }),
    fundsStatus: ledgerFundsStatus().notNull().default("pending_stripe"),
    occurredAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    consumedInBatchId: uuid().references(() => payoutBatches.id, {
      onDelete: "set null",
    }),
  },
  (t) => [
    check(
      "ck_ledger_order_id_for_order_lines",
      sql`case
      when ${t.entryType} in ('order_gross', 'platform_fee', 'stripe_fee', 'refund') then ${t.orderId} is not null
      else true
    end`,
    ),
    uniqueIndex("ux_ledger_source_ref").on(
      t.sourceSystem,
      t.sourceRef,
      t.entryType,
    ),
    index("ix_ledger_vendor_currency_time").on(
      t.vendorId,
      t.currency,
      t.occurredAt,
    ),
    index("ix_ledger_available_on").on(t.availableOn),
    index("ix_ledger_funds_status").on(t.vendorId, t.currency, t.fundsStatus),
    index("ix_ledger_vendor_order").on(t.vendorId, t.orderId),
    index("ix_ledger_stripe_charge_id")
      .on(t.stripeChargeId)
      .where(sql`${t.stripeChargeId} is not null`),
    index("ix_ledger_consumed_in_batch")
      .on(t.consumedInBatchId)
      .where(sql`${t.consumedInBatchId} is not null`),
    index("ix_ledger_vendor_available_unconsumed")
      .on(t.vendorId, t.currency, t.occurredAt)
      .where(
        sql`${t.entryType} = 'order_gross'
        and ${t.fundsStatus} = 'available'
        and ${t.consumedInBatchId} is null`,
      ),
  ],
);

export const stripeWebhookEvents = pgTable(
  "stripe_webhook_events",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    stripeEventId: text().notNull().unique(),
    eventType: text().notNull(),
    livemode: boolean().notNull(),
    payloadJson: jsonb().notNull(),
    payloadSha256: text().notNull(),
    receivedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp({ withTimezone: true }),
    processingResult: text(),
  },
  (t) => [index("ix_webhook_event_type").on(t.eventType)],
);

export const balanceSnapshots = pgTable(
  "balance_snapshots",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    accountScope: text().notNull(),
    stripeAccountId: text(),
    currency: text().notNull(),
    availableMinor: bigint({ mode: "bigint" }).notNull(),
    pendingMinor: bigint({ mode: "bigint" }).notNull(),
    sourceType: text(),
    capturedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("ix_balance_snapshots_scope_time").on(
      t.accountScope,
      sql`${t.capturedAt} desc`,
    ),
  ],
);

export const payoutBatchesRelations = relations(payoutBatches, ({ many }) => ({
  items: many(payoutBatchItems),
  consumedLedgerEntries: many(ledgerEntries),
}));

export const payoutBatchItemsRelations = relations(
  payoutBatchItems,
  ({ one, many }) => ({
    batch: one(payoutBatches, {
      fields: [payoutBatchItems.batchId],
      references: [payoutBatches.id],
    }),
    transfers: many(stripeTransfers),
  }),
);

export const stripeTransfersRelations = relations(
  stripeTransfers,
  ({ one }) => ({
    item: one(payoutBatchItems, {
      fields: [stripeTransfers.payoutBatchItemId],
      references: [payoutBatchItems.id],
    }),
  }),
);

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  consumedInBatch: one(payoutBatches, {
    fields: [ledgerEntries.consumedInBatchId],
    references: [payoutBatches.id],
  }),
}));

export type VendorStripeAccount = typeof vendorStripeAccounts.$inferSelect;
export type NewVendorStripeAccount = typeof vendorStripeAccounts.$inferInsert;

export type PayoutBatch = typeof payoutBatches.$inferSelect;
export type NewPayoutBatch = typeof payoutBatches.$inferInsert;

export type PayoutBatchItem = typeof payoutBatchItems.$inferSelect;
export type NewPayoutBatchItem = typeof payoutBatchItems.$inferInsert;

export type StripeTransfer = typeof stripeTransfers.$inferSelect;
export type NewStripeTransfer = typeof stripeTransfers.$inferInsert;

export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type NewLedgerEntry = typeof ledgerEntries.$inferInsert;

export type StripeWebhookEvent = typeof stripeWebhookEvents.$inferSelect;
export type NewStripeWebhookEvent = typeof stripeWebhookEvents.$inferInsert;

export type BalanceSnapshot = typeof balanceSnapshots.$inferSelect;
export type NewBalanceSnapshot = typeof balanceSnapshots.$inferInsert;
