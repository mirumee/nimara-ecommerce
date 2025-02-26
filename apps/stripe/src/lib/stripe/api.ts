import Stripe from "stripe";

import { responseError } from "@/lib/api/util";
import { isError } from "@/lib/error";
import { getLoggingProvider } from "@/providers/logging";

import { type SupportedStripeWebhookEvent } from "./const";

export const getStripeApi = (apiKey: string) => new Stripe(apiKey);

export const stripeRouteErrorsHandler =
  (handler: (request: Request, opts?: any) => Promise<Response>): any =>
  async (request: Request, opts?: any): Promise<Response> => {
    const logger = getLoggingProvider();

    try {
      return await handler(request, opts);
    } catch (err) {
      if (isError(err, Stripe.errors.StripeError)) {
        const json = await request.clone().json();
        const event = json as SupportedStripeWebhookEvent;

        logger.error("Stripe error occurred.", {
          error: err,
          id: event.id,
          type: event.type,
        });

        if (err.type === "StripeSignatureVerificationError") {
          return responseError({
            description: "Failed to verify Stripe webhook.",
            context: "headers > stripe-signature",
            errors: [{ message: err.message }],
          });
        }

        return responseError({
          description: "Stripe error occurred.",
          errors: [{ message: err.message }],
        });
      }

      throw err;
    }
  };
