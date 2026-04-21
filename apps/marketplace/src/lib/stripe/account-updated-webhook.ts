import { NextResponse } from "next/server";

import { METADATA_KEYS } from "@/lib/saleor/consts";
import {
  getVendorPageMetadata,
  updateVendorPageMetadata,
} from "@/lib/saleor/vendor-page-metadata";
import { mergeMetadata } from "@/lib/saleor/vendor-payment-metadata";
import { isStripeConnectOnboardingCompleted } from "@/lib/stripe/connect";

export type StripeAccountUpdatedPayload = {
  data?: {
    object?: {
      details_submitted?: boolean;
      id?: string;
      metadata?: Record<string, string>;
      requirements?: {
        currently_due?: string[];
      };
    };
  };
};

function resolveDefaultSaleorDomain(): string | null {
  const raw = process.env.NEXT_PUBLIC_SALEOR_URL;

  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

export async function handleStripeConnectAccountUpdated(
  event: StripeAccountUpdatedPayload,
): Promise<NextResponse> {
  const account = event.data?.object;

  if (!account?.id) {
    return NextResponse.json(
      { error: "Missing account id in Stripe event" },
      { status: 400 },
    );
  }

  const vendorPageId = account.metadata?.vendor_id?.trim();

  if (!vendorPageId) {
    return NextResponse.json({
      status: "skipped",
      reason: "missing_vendor_id",
    });
  }

  const saleorDomainFromMetadata = account.metadata?.saleor_domain?.trim();
  const saleorDomain = saleorDomainFromMetadata || resolveDefaultSaleorDomain();

  if (!saleorDomain) {
    return NextResponse.json(
      { error: "Cannot resolve Saleor domain for webhook update" },
      { status: 500 },
    );
  }

  const connected = isStripeConnectOnboardingCompleted({
    details_submitted: account.details_submitted,
    requirements: account.requirements,
  });
  const currentMetadata = await getVendorPageMetadata({
    saleorDomain,
    vendorPageId,
  });

  await updateVendorPageMetadata({
    saleorDomain,
    vendorPageId,
    metadata: mergeMetadata(currentMetadata, [
      {
        key: METADATA_KEYS.PAYMENT_ACCOUNT_ID,
        value: account.id,
      },
      {
        key: METADATA_KEYS.PAYMENT_ACCOUNT_CONNECTED,
        value: connected ? "true" : "false",
      },
    ]),
  });

  return NextResponse.json({
    status: "processed",
    connected,
    vendorPageId,
    stripeAccountId: account.id,
  });
}
