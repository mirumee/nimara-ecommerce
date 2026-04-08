import { APP_CONFIG } from "@/lib/saleor/consts";

interface PaymentIntentCreateInput {
  amount: number;
  automatic_payment_methods: {
    enabled: boolean;
  };
  currency: string;
  idempotencyKey?: string;
  metadata?: Record<string, string>;
  transfer_group?: string;
}

interface PaymentIntentCreateOutput {
  client_secret: string | null;
  id: string;
}

interface RefundCreateInput {
  amount: number;
  idempotencyKey?: string;
  metadata?: Record<string, string>;
  payment_intent: string;
}

type RefundStatus =
  | "pending"
  | "requires_action"
  | "succeeded"
  | "failed"
  | "canceled";

interface RefundCreateOutput {
  amount: number;
  currency: string;
  failure_reason: string | null;
  id: string;
  status: RefundStatus;
}

const toPaymentIntentFormBody = (
  input: PaymentIntentCreateInput,
): URLSearchParams => {
  const form = new URLSearchParams();

  form.set("amount", String(input.amount));
  form.set("currency", input.currency);
  form.set(
    "automatic_payment_methods[enabled]",
    String(input.automatic_payment_methods.enabled),
  );

  if (input.transfer_group) {
    form.set("transfer_group", input.transfer_group);
  }

  Object.entries(input.metadata ?? {}).forEach(([key, value]) => {
    form.set(`metadata[${key}]`, value);
  });

  return form;
};

const toRefundFormBody = (input: RefundCreateInput): URLSearchParams => {
  const form = new URLSearchParams();

  form.set("payment_intent", input.payment_intent);
  form.set("amount", String(input.amount));

  Object.entries(input.metadata ?? {}).forEach(([key, value]) => {
    form.set(`metadata[${key}]`, value);
  });

  return form;
};

const parseStripeError = (data: unknown, fallbackMessage: string) => {
  if (typeof data !== "object" || data === null || !("error" in data)) {
    return fallbackMessage;
  }

  const stripeError = data.error;

  if (
    typeof stripeError === "object" &&
    stripeError !== null &&
    "message" in stripeError &&
    typeof stripeError.message === "string"
  ) {
    return stripeError.message;
  }

  return fallbackMessage;
};

const paymentIntents = {
  create: async (
    input: PaymentIntentCreateInput,
  ): Promise<PaymentIntentCreateOutput> => {
    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        ...(input.idempotencyKey
          ? { "Idempotency-Key": input.idempotencyKey }
          : {}),
      },
      body: toPaymentIntentFormBody(input).toString(),
    });

    const data = (await response.json()) as unknown;

    if (!response.ok) {
      throw new Error(
        parseStripeError(data, "Stripe payment intent create failed."),
      );
    }

    if (
      typeof data !== "object" ||
      data === null ||
      !("id" in data) ||
      !("client_secret" in data)
    ) {
      throw new Error("Invalid Stripe response.");
    }

    return data as PaymentIntentCreateOutput;
  },
};

const refunds = {
  create: async (input: RefundCreateInput): Promise<RefundCreateOutput> => {
    const response = await fetch("https://api.stripe.com/v1/refunds", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        ...(input.idempotencyKey
          ? { "Idempotency-Key": input.idempotencyKey }
          : {}),
      },
      body: toRefundFormBody(input).toString(),
    });

    const data = (await response.json()) as unknown;

    if (!response.ok) {
      throw new Error(parseStripeError(data, "Stripe refund create failed."));
    }

    if (
      typeof data !== "object" ||
      data === null ||
      !("id" in data) ||
      !("status" in data) ||
      !("amount" in data) ||
      !("currency" in data)
    ) {
      throw new Error("Invalid Stripe refund response.");
    }

    return data as RefundCreateOutput;
  },
};

export const getStripeClient = () => ({ paymentIntents, refunds });
