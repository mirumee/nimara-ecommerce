import { config } from "@/lib/config";

type StripeApiError = {
  error?: { message?: string };
};

function assertStripeSecretKey(): string {
  const secretKey = config.stripeConnect.secretKey;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  return secretKey;
}

export type StripeBalancePayload = {
  available: Array<{ amount: number; currency: string }>;
  pending: Array<{ amount: number; currency: string }>;
};

export async function getStripePlatformBalance(): Promise<StripeBalancePayload> {
  const secretKey = assertStripeSecretKey();
  const response = await fetch("https://api.stripe.com/v1/balance", {
    method: "GET",
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const body = (await response.json()) as StripeApiError & StripeBalancePayload;

  if (!response.ok) {
    throw new Error(body.error?.message ?? "Stripe balance retrieval failed");
  }

  return body;
}

export type StripeBalanceTransaction = {
  available_on: number;
  id: string;
  status: string;
};

export type StripeChargeWithBalanceTransaction = {
  balance_transaction?: string | { available_on?: number; id?: string };
  id: string;
};

/**
 * Platform charge (ch_…) with expanded balance_transaction for available_on.
 */
export async function retrieveStripeCharge(
  chargeId: string,
): Promise<StripeChargeWithBalanceTransaction> {
  const secretKey = assertStripeSecretKey();
  const response = await fetch(
    `https://api.stripe.com/v1/charges/${encodeURIComponent(chargeId)}?expand[]=balance_transaction`,
    {
      headers: { Authorization: `Bearer ${secretKey}` },
      method: "GET",
    },
  );

  const body = (await response.json()) as StripeApiError &
    StripeChargeWithBalanceTransaction;

  if (!response.ok) {
    throw new Error(body.error?.message ?? "Stripe charge retrieval failed");
  }

  if (typeof body.id !== "string") {
    throw new Error("Invalid Stripe charge response");
  }

  return body;
}

export async function retrieveStripeBalanceTransaction(
  balanceTransactionId: string,
): Promise<StripeBalanceTransaction> {
  const secretKey = assertStripeSecretKey();
  const response = await fetch(
    `https://api.stripe.com/v1/balance_transactions/${balanceTransactionId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${secretKey}` },
    },
  );

  const body = (await response.json()) as StripeApiError &
    StripeBalanceTransaction;

  if (!response.ok) {
    throw new Error(
      body.error?.message ?? "Stripe balance transaction retrieval failed",
    );
  }

  return body;
}

export type CreateStripeTransferInput = {
  amountMinor: number;
  currency: string;
  destinationAccountId: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
  sourceTransaction?: string;
  transferGroup: string;
};

export async function createStripeConnectTransfer(
  input: CreateStripeTransferInput,
): Promise<{ amount: number; currency: string; id: string }> {
  const secretKey = assertStripeSecretKey();
  const body = new URLSearchParams();

  body.append("amount", String(input.amountMinor));
  body.append("currency", input.currency);
  body.append("destination", input.destinationAccountId);
  body.append("transfer_group", input.transferGroup);

  if (input.sourceTransaction) {
    body.append("source_transaction", input.sourceTransaction);
  }

  for (const [k, v] of Object.entries(input.metadata ?? {})) {
    body.append(`metadata[${k}]`, v);
  }

  const response = await fetch("https://api.stripe.com/v1/transfers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: body.toString(),
  });

  const json = (await response.json()) as StripeApiError & {
    amount: number;
    currency: string;
    id: string;
  };

  if (!response.ok) {
    throw new Error(json.error?.message ?? "Stripe transfer creation failed");
  }

  return json;
}
