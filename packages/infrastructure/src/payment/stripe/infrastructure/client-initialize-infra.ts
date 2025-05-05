import { loadStripe } from "@stripe/stripe-js";
import { invariant } from "graphql/jsutils/invariant";

import type {
  ClientInitializeInfra,
  PaymentServiceConfig,
  StripeServiceState,
} from "../../types";

const API_VERSION = "2022-11-15";

export const clientInitializeInfra =
  (
    { publicKey }: PaymentServiceConfig,
    state: StripeServiceState,
  ): ClientInitializeInfra =>
  async () => {
    const client = await loadStripe(publicKey, {
      apiVersion: API_VERSION,
    });

    invariant(client, "Could not load stripe client.");

    state.clientSDK = client;
  };
