import { err, ok } from "@nimara/domain/objects/Result";

import type { PaymentServiceConfig } from "../../types";
import type { PaymentInitializeGatewayInfra } from "../types";
import { loadStripe } from "../utils";

export const paymentInitializeGatewayInfra =
  ({
    logger,
    publicKey,
  }: PaymentServiceConfig): PaymentInitializeGatewayInfra =>
  async () => {
    const sdk = await loadStripe(publicKey);

    if (!sdk) {
      logger.error("Failed to initialize the Stripe SDK.");

      return err([{ code: "PAYMENT_GATEWAY_INITIALIZE_ERROR" }]);
    }

    return ok({ sdk });
  };
