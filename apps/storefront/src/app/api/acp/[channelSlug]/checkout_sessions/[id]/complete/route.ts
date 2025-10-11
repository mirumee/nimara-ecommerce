import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
) {
  const { id } = await params;

  // TODO: Add logic here to complete the checkout session with the given ID

  // Revalidate cache for this particular checkout session ID on update on success
  revalidateTag(`ACP:CHECKOUT_SESSION:${id}`);

  return NextResponse.json({ status: "Not implemented" }, { status: 501 });
}
