CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TYPE "public"."ledger_entry_type" AS ENUM('order_gross', 'platform_fee', 'stripe_fee', 'refund', 'adjustment', 'transfer_out', 'transfer_reversal');--> statement-breakpoint
CREATE TYPE "public"."ledger_funds_status" AS ENUM('pending_stripe', 'available', 'held', 'reversed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payout_batch_status" AS ENUM('draft', 'locked', 'executing', 'partially_paid', 'paid', 'failed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."payout_item_status" AS ENUM('pending', 'ready', 'processing', 'paid', 'failed', 'reversed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."stripe_transfer_status" AS ENUM('created', 'in_transit', 'paid', 'failed', 'reversed', 'canceled');--> statement-breakpoint
CREATE TABLE "balance_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_scope" text NOT NULL,
	"stripe_account_id" text,
	"currency" text NOT NULL,
	"available_minor" bigint NOT NULL,
	"pending_minor" bigint NOT NULL,
	"source_type" text,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" text NOT NULL,
	"order_id" text,
	"currency" text NOT NULL,
	"amount_minor" bigint NOT NULL,
	"entry_type" "ledger_entry_type" NOT NULL,
	"source_system" text NOT NULL,
	"source_ref" text NOT NULL,
	"transfer_group" text,
	"stripe_charge_id" text,
	"stripe_balance_transaction_id" text,
	"stripe_transfer_id" text,
	"available_on" timestamp with time zone,
	"funds_status" "ledger_funds_status" DEFAULT 'pending_stripe' NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"consumed_in_batch_id" uuid,
	CONSTRAINT "ck_ledger_order_id_for_order_lines" CHECK (case
      when "ledger_entries"."entry_type" in ('order_gross', 'platform_fee', 'stripe_fee', 'refund') then "ledger_entries"."order_id" is not null
      else true
    end)
);
--> statement-breakpoint
CREATE TABLE "payout_batch_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"vendor_id" text NOT NULL,
	"stripe_account_id" text NOT NULL,
	"currency" text NOT NULL,
	"gross_minor" bigint NOT NULL,
	"fees_minor" bigint NOT NULL,
	"net_minor" bigint NOT NULL,
	"ledger_cutoff_ts" timestamp with time zone NOT NULL,
	"status" "payout_item_status" DEFAULT 'pending' NOT NULL,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payout_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"currency" text NOT NULL,
	"status" "payout_batch_status" DEFAULT 'draft' NOT NULL,
	"locked_at" timestamp with time zone,
	"executed_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payout_batch_item_id" uuid NOT NULL,
	"stripe_transfer_id" text NOT NULL,
	"destination_account" text NOT NULL,
	"transfer_group" text NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" "stripe_transfer_status" DEFAULT 'created' NOT NULL,
	"amount_reversed_minor" bigint DEFAULT 0 NOT NULL,
	"stripe_balance_transaction_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stripe_transfers_stripeTransferId_unique" UNIQUE("stripe_transfer_id"),
	CONSTRAINT "stripe_transfers_idempotencyKey_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "stripe_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"livemode" boolean NOT NULL,
	"payload_json" jsonb NOT NULL,
	"payload_sha256" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"processing_result" text,
	CONSTRAINT "stripe_webhook_events_stripeEventId_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
CREATE TABLE "vendor_stripe_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" text NOT NULL,
	"stripe_account_id" text NOT NULL,
	"payouts_enabled" boolean DEFAULT false NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"default_currency" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_stripe_accounts_vendorId_unique" UNIQUE("vendor_id"),
	CONSTRAINT "vendor_stripe_accounts_stripeAccountId_unique" UNIQUE("stripe_account_id")
);
--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_consumed_in_batch_id_payout_batches_id_fk" FOREIGN KEY ("consumed_in_batch_id") REFERENCES "public"."payout_batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_batch_items" ADD CONSTRAINT "payout_batch_items_batch_id_payout_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."payout_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_transfers" ADD CONSTRAINT "stripe_transfers_payout_batch_item_id_payout_batch_items_id_fk" FOREIGN KEY ("payout_batch_item_id") REFERENCES "public"."payout_batch_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ix_balance_snapshots_scope_time" ON "balance_snapshots" USING btree ("account_scope","captured_at" desc);--> statement-breakpoint
CREATE UNIQUE INDEX "ux_ledger_source_ref" ON "ledger_entries" USING btree ("source_system","source_ref","entry_type");--> statement-breakpoint
CREATE INDEX "ix_ledger_vendor_currency_time" ON "ledger_entries" USING btree ("vendor_id","currency","occurred_at");--> statement-breakpoint
CREATE INDEX "ix_ledger_available_on" ON "ledger_entries" USING btree ("available_on");--> statement-breakpoint
CREATE INDEX "ix_ledger_funds_status" ON "ledger_entries" USING btree ("vendor_id","currency","funds_status");--> statement-breakpoint
CREATE INDEX "ix_ledger_vendor_order" ON "ledger_entries" USING btree ("vendor_id","order_id");--> statement-breakpoint
CREATE INDEX "ix_ledger_stripe_charge_id" ON "ledger_entries" USING btree ("stripe_charge_id") WHERE "ledger_entries"."stripe_charge_id" is not null;--> statement-breakpoint
CREATE INDEX "ix_ledger_consumed_in_batch" ON "ledger_entries" USING btree ("consumed_in_batch_id") WHERE "ledger_entries"."consumed_in_batch_id" is not null;--> statement-breakpoint
CREATE INDEX "ix_ledger_vendor_available_unconsumed" ON "ledger_entries" USING btree ("vendor_id","currency","occurred_at") WHERE "ledger_entries"."entry_type" = 'order_gross'
        and "ledger_entries"."funds_status" = 'available'
        and "ledger_entries"."consumed_in_batch_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "payout_batch_items_batch_id_vendor_id_key" ON "payout_batch_items" USING btree ("batch_id","vendor_id");--> statement-breakpoint
CREATE INDEX "ix_batch_items_status" ON "payout_batch_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ix_transfers_status" ON "stripe_transfers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ix_webhook_event_type" ON "stripe_webhook_events" USING btree ("event_type");