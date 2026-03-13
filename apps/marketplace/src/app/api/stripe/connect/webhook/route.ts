import { NextResponse } from "next/server";

import { METADATA_KEYS } from "@/lib/saleor/consts";
import {
  getVendorPageMetadata,
  updateVendorPageMetadata,
} from "@/lib/saleor/vendor-page-metadata";
import { mergeMetadata } from "@/lib/saleor/vendor-payment-metadata";
import {
  isStripeConnectOnboardingCompleted,
  verifyStripeWebhookSignature,
} from "@/lib/stripe/connect";

type StripeAccountUpdatedEvent = {
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
  id?: string;
  type?: string;
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

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    const payload = await request.text();
    const verified = verifyStripeWebhookSignature({ payload, signature });

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 },
      );
    }

    const event = JSON.parse(payload) as StripeAccountUpdatedEvent;

    if (event.type !== "account.updated") {
      return NextResponse.json({ status: "ignored", type: event.type ?? null });
    }

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
    const saleorDomain =
      saleorDomainFromMetadata || resolveDefaultSaleorDomain();

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
  } catch (error) {
    console.error("[stripe-connect] Failed to process webhook", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process Stripe webhook",
      },
      { status: 500 },
    );
  }
}
