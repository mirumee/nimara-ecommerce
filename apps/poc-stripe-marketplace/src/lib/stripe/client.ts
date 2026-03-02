import { CONFIG } from "@/config";

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

const toFormBody = (input: PaymentIntentCreateInput): URLSearchParams => {
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

const paymentIntents = {
  create: async (
    input: PaymentIntentCreateInput,
  ): Promise<PaymentIntentCreateOutput> => {
    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CONFIG.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        ...(input.idempotencyKey
          ? { "Idempotency-Key": input.idempotencyKey }
          : {}),
      },
      body: toFormBody(input).toString(),
    });

    const data = (await response.json()) as
      | PaymentIntentCreateOutput
      | {
          error?: {
            message?: string;
          };
        };

    if (!response.ok) {
      throw new Error(
        "error" in data && data.error?.message
          ? data.error.message
          : "Stripe payment intent create failed.",
      );
    }

    if (!("id" in data)) {
      throw new Error("Invalid Stripe response.");
    }

    return data;
  },
};

export const getStripeClient = () => ({ paymentIntents });
