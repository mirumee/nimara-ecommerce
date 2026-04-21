import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiRouteAuthToken } from "@/lib/auth/server";
import { syncLedgerSettlementFromStripe } from "@/lib/ledger/sync-ledger-settlement-from-stripe";

const querySchema = z.object({
  chargeLimit: z.coerce.number().int().min(1).max(2000).optional(),
});

export async function POST(request: Request) {
  const token = await getApiRouteAuthToken();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsedQuery = querySchema.safeParse({
    chargeLimit: url.searchParams.get("chargeLimit") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid query", issues: parsedQuery.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await syncLedgerSettlementFromStripe({
      chargeLimit: parsedQuery.data.chargeLimit,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: "Ledger database not configured" },
        { status: 503 },
      );
    }

    return NextResponse.json({
      chargeErrors: result.chargeErrors,
      chargesSynced: result.chargesSynced,
      chargeIdsAttempted: result.chargeIdsAttempted,
      promotedByDateCount: result.promotedByDateCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
