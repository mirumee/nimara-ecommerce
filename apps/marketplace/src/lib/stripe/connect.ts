import crypto from "node:crypto";

import { config } from "@/lib/config";

type StripeApiError = {
  error?: {
    code?: string;
    message?: string;
    param?: string;
    type?: string;
  };
};

type StripeRequirements = {
  currently_due?: string[];
};

export type StripeConnectAccount = {
  default_currency?: string;
  details_submitted?: boolean;
  id: string;
  metadata?: Record<string, string>;
  payouts_enabled?: boolean;
  requirements?: StripeRequirements;
};

function assertStripeSecretKey(): string {
  const secretKey = config.stripeConnect.secretKey;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  return secretKey;
}

function toFormBody(
  payload: Record<string, string | number | boolean | null | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(payload)) {
    if (value == null) {
      continue;
    }
    params.append(key, String(value));
  }

  return params;
}

async function stripeRequest<TResponse>(
  path: string,
  payload: Record<string, string | number | boolean | null | undefined>,
): Promise<TResponse> {
  const secretKey = assertStripeSecretKey();
  const response = await fetch(`https://api.stripe.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: toFormBody(payload).toString(),
  });

  const body = (await response.json()) as StripeApiError & TResponse;

  if (!response.ok) {
    const message =
      body.error?.message ?? `Stripe API failed (${response.status})`;

    throw new Error(message);
  }

  return body;
}

export async function createStripeConnectAccount(input: {
  email?: string;
  saleorDomain?: string;
  vendorId: string;
}): Promise<StripeConnectAccount> {
  return stripeRequest<StripeConnectAccount>("/v1/accounts", {
    country: config.stripeConnect.defaultCountry,
    email: input.email,
    "controller[fees][payer]": "application",
    "controller[losses][payments]": "application",
    "controller[stripe_dashboard][type]": "express",
    "metadata[saleor_domain]": input.saleorDomain,
    "metadata[vendor_id]": input.vendorId,
  });
}

export async function createStripeConnectOnboardingLink(input: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  return stripeRequest<{ url: string }>("/v1/account_links", {
    account: input.accountId,
    refresh_url: input.refreshUrl,
    return_url: input.returnUrl,
    type: "account_onboarding",
  });
}

export async function createStripeConnectLoginLink(input: {
  accountId: string;
}): Promise<{ url: string }> {
  return stripeRequest<{ url: string }>(
    `/v1/accounts/${input.accountId}/login_links`,
    {},
  );
}

export async function getStripeConnectAccount(input: {
  accountId: string;
}): Promise<StripeConnectAccount> {
  const secretKey = assertStripeSecretKey();
  const response = await fetch(
    `https://api.stripe.com/v1/accounts/${input.accountId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    },
  );

  const body = (await response.json()) as StripeApiError & StripeConnectAccount;

  if (!response.ok) {
    const message =
      body.error?.message ?? `Stripe API failed (${response.status})`;

    throw new Error(message);
  }

  return body;
}

export function isStripeConnectOnboardingCompleted(
  account: Pick<StripeConnectAccount, "details_submitted" | "requirements">,
): boolean {
  const currentlyDue = account.requirements?.currently_due ?? [];

  return Boolean(account.details_submitted) && currentlyDue.length === 0;
}

function parseStripeSignature(signature: string): {
  timestamp: string;
  v1Signatures: string[];
} | null {
  const chunks = signature.split(",").map((value) => value.trim());
  const timestamp = chunks
    .find((value) => value.startsWith("t="))
    ?.replace(/^t=/, "");
  const v1Signatures = chunks
    .filter((value) => value.startsWith("v1="))
    .map((value) => value.replace(/^v1=/, ""));

  if (!timestamp || v1Signatures.length === 0) {
    return null;
  }

  return { timestamp, v1Signatures };
}

export function verifyStripeWebhookSignature(input: {
  payload: string;
  signature: string;
  toleranceSeconds?: number;
  webhookSecret?: string;
}): boolean {
  const webhookSecret =
    input.webhookSecret ?? config.stripeConnect.webhookSecret;

  if (!webhookSecret) {
    throw new Error("MARKETPLACE_STRIPE_CONNECT_WEBHOOK_SECRET is not set");
  }

  const parsed = parseStripeSignature(input.signature);

  if (!parsed) {
    return false;
  }

  const tolerance = input.toleranceSeconds ?? 300;
  const timestampMs = Number(parsed.timestamp) * 1000;

  if (!Number.isFinite(timestampMs)) {
    return false;
  }

  const now = Date.now();

  if (Math.abs(now - timestampMs) > tolerance * 1000) {
    return false;
  }

  const signedPayload = `${parsed.timestamp}.${input.payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return parsed.v1Signatures.some((candidate) => {
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const candidateBuffer = Buffer.from(candidate, "hex");

    if (expectedBuffer.length !== candidateBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, candidateBuffer);
  });
}
