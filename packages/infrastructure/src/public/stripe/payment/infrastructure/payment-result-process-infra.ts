import { isCheckoutPaid } from "../helpers";
import type { PaymentResultProcessInfra } from "../types";

export const paymentResultProcessInfra: PaymentResultProcessInfra = async ({
  checkout,
}) => {
  return { isSuccess: isCheckoutPaid(checkout), errors: [] };
};
