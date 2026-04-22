import { NextResponse } from "next/server";

import { getLedgerDb } from "@/lib/ledger/db/client";
import { upsertVendorStripeAccount } from "@/lib/ledger/repository";
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
import {
  finalizeStripeWebhookInbox,
  isLedgerStripeEventType,
  processLedgerStripeSideEffects,
  type StripeWebhookEventEnvelope,
  tryRecordStripeWebhookInbox,
} from "@/lib/stripe/process-ledger-stripe-webhook";

type StripeAccountObject = {
  default_currency?: string;
  details_submitted?: boolean;
  id?: string;
  metadata?: Record<string, string>;
  payouts_enabled?: boolean;
  requirements?: {
    currently_due?: string[];
  };
};

type StripeIncomingEvent = {
  data?: { object?: StripeAccountObject };
  id: string;
  livemode: boolean;
  type: string;
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

    const event = JSON.parse(payload) as StripeIncomingEvent;

    if (event.type === "account.updated") {
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

      const db = getLedgerDb();

      if (db) {
        const defaultCurrency =
          typeof account.default_currency === "string"
            ? account.default_currency
            : "usd";

        await upsertVendorStripeAccount(db, {
          defaultCurrency,
          onboardingCompleted: connected,
          payoutsEnabled: Boolean(account.payouts_enabled),
          stripeAccountId: account.id,
          vendorId: vendorPageId,
        });
      }

      return NextResponse.json({
        status: "processed",
        connected,
        stripeAccountId: account.id,
        vendorPageId,
      });
    }

    const db = getLedgerDb();

    if (db && isLedgerStripeEventType(event.type)) {
      const envelope: StripeWebhookEventEnvelope = {
        data: event.data,
        id: event.id,
        livemode: event.livemode,
        type: event.type,
      };

      const inserted = await tryRecordStripeWebhookInbox(db, payload, envelope);

      if (!inserted) {
        return NextResponse.json({
          eventId: event.id,
          status: "duplicate",
        });
      }

      try {
        await processLedgerStripeSideEffects(db, envelope);
        await finalizeStripeWebhookInbox(db, event.id, "ok");
      } catch (error) {
        await finalizeStripeWebhookInbox(
          db,
          event.id,
          error instanceof Error ? error.message : "error",
        );
        console.error(
          "[stripe-connect] Ledger webhook processing failed",
          error,
        );

        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Ledger webhook processing failed",
          },
          { status: 500 },
        );
      }

      return NextResponse.json({
        ledger: true,
        status: "processed",
      });
    }

    return NextResponse.json({ status: "ignored", type: event.type });
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
