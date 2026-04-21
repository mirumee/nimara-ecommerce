import { NextResponse } from "next/server";

import { getApiRouteAuthToken } from "@/lib/auth/server";
import { executePayoutBatchTransfers } from "@/lib/ledger/execute-payout-batch";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await getApiRouteAuthToken();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const result = await executePayoutBatchTransfers(id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[payouts/execute]", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Execute failed",
      },
      { status: 500 },
    );
  }
}
