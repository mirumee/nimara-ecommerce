-- Marketplace ledger + Stripe Connect batch transfers
-- Settlement path: ledger → payout_batches → stripe_transfers (Transfer to Connect accounts).
-- Stripe Payout objects (bank payouts from Connect balance) are not persisted; use Stripe Dashboard/API if needed.
create extension if not exists "pgcrypto";

create table if not exists vendor_stripe_accounts (
  id uuid primary key default gen_random_uuid(),
  vendor_id text not null unique,
  stripe_account_id text not null unique,
  payouts_enabled boolean not null default false,
  onboarding_completed boolean not null default false,
  default_currency text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ledger_entry_type') then
    create type ledger_entry_type as enum (
      'order_gross',
      'platform_fee',
      'stripe_fee',
      'refund',
      'adjustment',
      'transfer_out',
      'transfer_reversal'
    );
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ledger_funds_status') then
    create type ledger_funds_status as enum (
      'pending_stripe',
      'available',
      'held',
      'reversed',
      'refunded'
    );
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payout_batch_status') then
    create type payout_batch_status as enum (
      'draft',
      'locked',
      'executing',
      'partially_paid',
      'paid',
      'failed',
      'canceled'
    );
  end if;
end$$;

create table if not exists payout_batches (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  currency text not null,
  status payout_batch_status not null default 'draft',
  locked_at timestamptz,
  executed_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payout_item_status') then
    create type payout_item_status as enum (
      'pending',
      'ready',
      'processing',
      'paid',
      'failed',
      'reversed',
      'skipped'
    );
  end if;
end$$;

create table if not exists payout_batch_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references payout_batches(id),
  vendor_id text not null,
  stripe_account_id text not null,
  currency text not null,
  gross_minor bigint not null,
  fees_minor bigint not null,
  net_minor bigint not null,
  ledger_cutoff_ts timestamptz not null,
  status payout_item_status not null default 'pending',
  failure_reason text,
  created_at timestamptz not null default now(),
  unique (batch_id, vendor_id)
);
create index if not exists ix_batch_items_status on payout_batch_items(status);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'stripe_transfer_status') then
    create type stripe_transfer_status as enum (
      'created',
      'in_transit',
      'paid',
      'failed',
      'reversed',
      'canceled'
    );
  end if;
end$$;

create table if not exists stripe_transfers (
  id uuid primary key default gen_random_uuid(),
  payout_batch_item_id uuid not null references payout_batch_items(id),
  stripe_transfer_id text not null unique,
  destination_account text not null,
  transfer_group text not null,
  amount_minor bigint not null,
  currency text not null,
  idempotency_key text not null unique,
  status stripe_transfer_status not null default 'created',
  amount_reversed_minor bigint not null default 0,
  stripe_balance_transaction_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ix_transfers_status on stripe_transfers(status);

create table if not exists ledger_entries (
  id uuid primary key default gen_random_uuid(),
  vendor_id text not null,
  order_id text,
  currency text not null,
  amount_minor bigint not null,
  entry_type ledger_entry_type not null,
  source_system text not null,
  source_ref text not null,
  transfer_group text,
  stripe_charge_id text,
  stripe_balance_transaction_id text,
  stripe_transfer_id text,
  available_on timestamptz,
  funds_status ledger_funds_status not null default 'pending_stripe',
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  consumed_in_batch_id uuid references payout_batches(id) on delete set null,
  constraint ck_ledger_order_id_for_order_lines check (
    case
      when entry_type in ('order_gross', 'platform_fee', 'stripe_fee', 'refund') then order_id is not null
      else true
    end
  )
);

create unique index if not exists ux_ledger_source_ref
  on ledger_entries(source_system, source_ref, entry_type);
create index if not exists ix_ledger_vendor_currency_time
  on ledger_entries(vendor_id, currency, occurred_at);
create index if not exists ix_ledger_available_on
  on ledger_entries(available_on);
create index if not exists ix_ledger_funds_status
  on ledger_entries(vendor_id, currency, funds_status);
create index if not exists ix_ledger_vendor_order
  on ledger_entries(vendor_id, order_id);
create index if not exists ix_ledger_stripe_charge_id
  on ledger_entries(stripe_charge_id)
  where stripe_charge_id is not null;
create index if not exists ix_ledger_consumed_in_batch
  on ledger_entries (consumed_in_batch_id)
  where consumed_in_batch_id is not null;
create index if not exists ix_ledger_vendor_available_unconsumed on ledger_entries (vendor_id, currency, occurred_at)
  where entry_type = 'order_gross'
    and funds_status = 'available'
    and consumed_in_batch_id is null;

create table if not exists stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  livemode boolean not null,
  payload_json jsonb not null,
  payload_sha256 text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_result text
);
create index if not exists ix_webhook_event_type on stripe_webhook_events(event_type);

create table if not exists balance_snapshots (
  id uuid primary key default gen_random_uuid(),
  account_scope text not null,
  stripe_account_id text,
  currency text not null,
  available_minor bigint not null,
  pending_minor bigint not null,
  source_type text,
  captured_at timestamptz not null default now()
);
create index if not exists ix_balance_snapshots_scope_time
  on balance_snapshots(account_scope, captured_at desc);
