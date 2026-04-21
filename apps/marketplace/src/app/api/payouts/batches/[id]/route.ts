import { NextResponse } from "next/server";

import { getApiRouteAuthToken } from "@/lib/auth/server";
import { config } from "@/lib/config";
import { getLedgerPool } from "@/lib/ledger/pool";
import { getPayoutBatchWithItems } from "@/lib/ledger/repository";
import { fetchVendorTitlesByIds } from "@/lib/saleor/fetch-vendor-page-titles";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await getApiRouteAuthToken();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const pool = getLedgerPool();

  if (!pool) {
    return NextResponse.json(
      { error: "Ledger database not configured" },
      { status: 503 },
    );
  }

  const data = await getPayoutBatchWithItems(pool, id);

  if (!data.batch) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const vendorIdList = [...new Set(data.items.map((i) => i.vendor_id))];
  const vendorTitleById = await fetchVendorTitlesByIds(vendorIdList, token);

  const batch = {
    ...data.batch,
    created_at: data.batch.created_at.toISOString(),
    executed_at: data.batch.executed_at
      ? data.batch.executed_at.toISOString()
      : null,
  };

  const items = data.items.map((item) => ({
    ...item,
    stripe_transfer_created_at: item.stripe_transfer_created_at
      ? item.stripe_transfer_created_at.toISOString()
      : null,
  }));

  return NextResponse.json({
    batch,
    items,
    saleorDashboardBaseUrl: config.saleor.dashboardBaseUrl,
    vendorTitleById,
  });
}
