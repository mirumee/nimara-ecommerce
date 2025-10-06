import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  _props: { params: Promise<{ channelSlug: string; id: string }> },
) {
  return NextResponse.json({ status: "Not implemented" }, { status: 501 });
}
