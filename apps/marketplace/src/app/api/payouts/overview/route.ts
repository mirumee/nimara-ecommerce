import { NextResponse } from "next/server";

import {
  getApiRouteAuthToken,
  getVendorIdFromAccessToken,
} from "@/lib/auth/server";
import { config } from "@/lib/config";
import { getLedgerPool } from "@/lib/ledger/pool";
import {
  getVendorLedgerSummary,
  listAllLedgerLines,
  listRecentPayoutBatches,
  listVendorLedgerLines,
} from "@/lib/ledger/repository";
import { fetchVendorTitlesByIds } from "@/lib/saleor/fetch-vendor-page-titles";

const LEDGER_LINES_LIMIT = 200;

export async function GET() {
  const token = await getApiRouteAuthToken();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = getLedgerPool();

  if (!pool) {
    return NextResponse.json({
      batches: [],
      configured: false,
      ledgerLines: [],
      vendorSummary: null,
    });
  }

  const vendorIdPromise = getVendorIdFromAccessToken(token);

  const [batches, vendorId] = await Promise.all([
    listRecentPayoutBatches(pool, 20),
    vendorIdPromise,
  ]);

  let ledgerLinesRaw: Awaited<ReturnType<typeof listAllLedgerLines>>;
  let vendorSummaryRaw: Awaited<
    ReturnType<typeof getVendorLedgerSummary>
  > | null;

  if (vendorId) {
    const [summary, lines] = await Promise.all([
      getVendorLedgerSummary(pool, vendorId),
      listVendorLedgerLines(pool, vendorId, {
        limit: LEDGER_LINES_LIMIT,
      }),
    ]);

    vendorSummaryRaw = summary;
    ledgerLinesRaw = lines;
  } else {
    vendorSummaryRaw = null;
    ledgerLinesRaw = await listAllLedgerLines(pool, {
      limit: LEDGER_LINES_LIMIT,
    });
  }

  const vendorSummary = vendorSummaryRaw
    ? {
        available_minor: vendorSummaryRaw.available_minor.toString(),
        currency: vendorSummaryRaw.currency,
        pending_minor: vendorSummaryRaw.pending_minor.toString(),
      }
    : null;

  const ledgerLines = ledgerLinesRaw.map((r) => ({
    amount_minor: r.amount_minor,
    available_on: r.available_on ? r.available_on.toISOString() : null,
    consumed_in_batch_id: r.consumed_in_batch_id,
    currency: r.currency,
    funds_status: r.funds_status,
    id: r.id,
    occurred_at: r.occurred_at.toISOString(),
    order_id: r.order_id,
    stripe_charge_id: r.stripe_charge_id,
    vendor_id: r.vendor_id,
  }));

  const vendorIdsForTitles = [...new Set(ledgerLines.map((l) => l.vendor_id))];
  const vendorTitleById = await fetchVendorTitlesByIds(
    vendorIdsForTitles,
    token,
  );

  const batchesOut = batches.map((b) => ({
    created_at: b.created_at.toISOString(),
    currency: b.currency,
    executed_at: b.executed_at ? b.executed_at.toISOString() : null,
    id: b.id,
    period_end: b.period_end,
    period_start: b.period_start,
    status: b.status,
    transfer_initiated_at: b.transfer_initiated_at
      ? b.transfer_initiated_at.toISOString()
      : null,
  }));

  return NextResponse.json({
    batches: batchesOut,
    configured: true,
    ledgerLines,
    saleorDashboardBaseUrl: config.saleor.dashboardBaseUrl,
    vendorSummary,
    vendorTitleById,
  });
}
