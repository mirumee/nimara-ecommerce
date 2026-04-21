import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiRouteAuthToken } from "@/lib/auth/server";
import { closePayoutBatchForPeriod } from "@/lib/ledger/close-payout-batch";

const bodySchema = z.object({
  createdBy: z.string().min(1).max(256).optional(),
  currency: z.string().min(3).max(8),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: Request) {
  const token = await getApiRouteAuthToken();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await closePayoutBatchForPeriod({
    createdBy: parsed.data.createdBy ?? "marketplace",
    currency: parsed.data.currency,
    periodEnd: parsed.data.periodEnd,
    periodStart: parsed.data.periodStart,
  });

  if (!result.ok) {
    if (result.reason === "no_database") {
      return NextResponse.json(
        { error: "Ledger database not configured" },
        { status: 503 },
      );
    }

    if (result.reason === "no_eligible_lines") {
      return NextResponse.json(
        {
          error:
            "No eligible ledger lines for this period and currency (need order_gross with funds_status=available, not yet in a batch).",
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { error: "Could not close period" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    batchId: result.batchId,
    itemCount: result.itemCount,
  });
}
