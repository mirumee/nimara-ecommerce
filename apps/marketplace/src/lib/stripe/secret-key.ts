import { config } from "@/lib/config";

export function assertStripeSecretKey(): string {
  const secretKey = config.stripeConnect.secretKey;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  return secretKey;
}
