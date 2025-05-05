import { ok } from "@nimara/domain/objects/Result";

import { isCheckoutPaid } from "../../helpers";
import type { PaymentResultProcessInfra } from "../../types";

export const paymentResultProcessInfra: PaymentResultProcessInfra = async ({
  checkout,
}) => ok({ isCheckoutPaid: isCheckoutPaid(checkout) });
