import { err, ok } from "@nimara/domain/objects/Result";

import type { PaymentServiceConfig } from "../../types";
import type { StripePaymentGatewayInitializeInfra } from "../types";
import { loadStripe } from "../utils";

export const paymentInitializeGatewayInfra =
  ({ logger }: PaymentServiceConfig): StripePaymentGatewayInitializeInfra =>
  async ({ gatewayConfig }) => {
    let sdk;

    /**
     * Left unhandled, a rejected load surfaces as an unhandled rejection and
     * the payment form silently never mounts.
     */
    try {
      sdk = await loadStripe(gatewayConfig);
    } catch (error) {
      logger.error("Failed to load the Stripe SDK.", { error });

      return err([{ code: "PAYMENT_GATEWAY_INITIALIZE_ERROR" }]);
    }

    if (!sdk) {
      logger.error("Failed to initialize the Stripe SDK.");

      return err([{ code: "PAYMENT_GATEWAY_INITIALIZE_ERROR" }]);
    }

    return ok({ sdk });
  };
