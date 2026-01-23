import { loadStripe } from "@stripe/stripe-js";
import { invariant } from "graphql/jsutils/invariant";

import type {
  ClientInitializeInfra,
  PaymentServiceConfig,
  StripeServiceState,
} from "../../types";

export const clientInitializeInfra =
  (
    { publicKey }: PaymentServiceConfig,
    state: StripeServiceState,
  ): ClientInitializeInfra =>
  async () => {
    const client = await loadStripe(publicKey);

    invariant(client, "Could not load stripe client.");

    state.clientSDK = client;
  };
