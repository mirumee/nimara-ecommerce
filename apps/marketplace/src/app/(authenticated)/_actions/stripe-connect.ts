"use server";

import { getServerAuthToken, getServerVendorId } from "@/lib/auth/server";
import { config } from "@/lib/config";
import { getLedgerDb } from "@/lib/ledger/db/client";
import { upsertVendorStripeAccount } from "@/lib/ledger/repository";
import { METADATA_KEYS } from "@/lib/saleor/consts";
import {
  getVendorPageMetadata,
  resolveSaleorDomainFromToken,
  updateVendorPageMetadata,
} from "@/lib/saleor/vendor-page-metadata";
import {
  getVendorPaymentMetadata,
  mergeMetadata,
} from "@/lib/saleor/vendor-payment-metadata";
import {
  createStripeConnectAccount,
  createStripeConnectLoginLink,
  createStripeConnectOnboardingLink,
  getStripeConnectAccount,
  isStripeConnectOnboardingCompleted,
} from "@/lib/stripe/connect";
import { configurationService } from "@/services/configuration";

type ActionResult =
  | {
      error: string;
      ok: false;
    }
  | {
      ok: true;
      url: string;
    };

type SyncResult =
  | {
      error: string;
      ok: false;
    }
  | {
      connected: boolean;
      ok: true;
      paymentAccountId: string;
    };

async function getCurrentVendorContext() {
  const token = await getServerAuthToken();

  if (!token) {
    throw new Error("Missing auth token");
  }

  const vendorPageId = await getServerVendorId();

  if (!vendorPageId) {
    throw new Error("Vendor profile not found");
  }

  const saleorDomain = resolveSaleorDomainFromToken(token);

  return { saleorDomain, token, vendorPageId };
}

function getStripeRedirectUrls() {
  const baseUrl = config.urls.vendor.replace(/\/$/, "");
  const dashboardUrl = `${baseUrl}/dashboard`;

  return {
    refreshUrl: `${dashboardUrl}?stripe=refresh`,
    returnUrl: `${dashboardUrl}?stripe=return`,
  };
}

export async function createStripeConnectOnboardingSession(): Promise<ActionResult> {
  try {
    const { saleorDomain, token, vendorPageId } =
      await getCurrentVendorContext();
    const vendorMetadata = await getVendorPageMetadata({
      saleorDomain,
      vendorPageId,
    });
    const paymentMetadata = getVendorPaymentMetadata(vendorMetadata);

    let paymentAccountId = paymentMetadata.paymentAccountId;

    if (!paymentAccountId) {
      const meResult = await configurationService.getMe(token);
      const email =
        meResult.ok && meResult.data.me?.email
          ? String(meResult.data.me.email)
          : undefined;
      const account = await createStripeConnectAccount({
        email,
        saleorDomain,
        vendorId: vendorPageId,
      });

      paymentAccountId = account.id;
      await updateVendorPageMetadata({
        saleorDomain,
        vendorPageId,
        metadata: mergeMetadata(vendorMetadata, [
          {
            key: METADATA_KEYS.PAYMENT_ACCOUNT_ID,
            value: paymentAccountId,
          },
          {
            key: METADATA_KEYS.PAYMENT_ACCOUNT_CONNECTED,
            value: "false",
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
          onboardingCompleted: false,
          payoutsEnabled: Boolean(account.payouts_enabled),
          stripeAccountId: paymentAccountId,
          vendorId: vendorPageId,
        });
      }
    }

    const redirectUrls = getStripeRedirectUrls();
    const accountLink = await createStripeConnectOnboardingLink({
      accountId: paymentAccountId,
      refreshUrl: redirectUrls.refreshUrl,
      returnUrl: redirectUrls.returnUrl,
    });

    return {
      ok: true,
      url: accountLink.url,
    };
  } catch (error) {
    console.error(
      "[stripe-connect] Failed to create onboarding session",
      error,
    );

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create Stripe onboarding session",
    };
  }
}

export async function createStripeConnectLoginSession(): Promise<ActionResult> {
  try {
    const { saleorDomain, vendorPageId } = await getCurrentVendorContext();
    const vendorMetadata = await getVendorPageMetadata({
      saleorDomain,
      vendorPageId,
    });
    const paymentMetadata = getVendorPaymentMetadata(vendorMetadata);

    if (!paymentMetadata.paymentAccountId) {
      return {
        ok: false,
        error: "Stripe account is not configured",
      };
    }

    const loginLink = await createStripeConnectLoginLink({
      accountId: paymentMetadata.paymentAccountId,
    });

    return {
      ok: true,
      url: loginLink.url,
    };
  } catch (error) {
    console.error("[stripe-connect] Failed to create login session", error);

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create Stripe login session",
    };
  }
}

export async function syncStripeConnectStatus(): Promise<SyncResult> {
  try {
    const { saleorDomain, vendorPageId } = await getCurrentVendorContext();
    const vendorMetadata = await getVendorPageMetadata({
      saleorDomain,
      vendorPageId,
    });
    const paymentMetadata = getVendorPaymentMetadata(vendorMetadata);

    if (!paymentMetadata.paymentAccountId) {
      return {
        ok: false,
        error: "Stripe account is not configured",
      };
    }

    const account = await getStripeConnectAccount({
      accountId: paymentMetadata.paymentAccountId,
    });
    const connected = isStripeConnectOnboardingCompleted(account);

    await updateVendorPageMetadata({
      saleorDomain,
      vendorPageId,
      metadata: mergeMetadata(vendorMetadata, [
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
        stripeAccountId: paymentMetadata.paymentAccountId,
        vendorId: vendorPageId,
      });
    }

    return {
      ok: true,
      connected,
      paymentAccountId: paymentMetadata.paymentAccountId,
    };
  } catch (error) {
    console.error("[stripe-connect] Failed to sync Stripe status", error);

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to sync Stripe account status",
    };
  }
}
