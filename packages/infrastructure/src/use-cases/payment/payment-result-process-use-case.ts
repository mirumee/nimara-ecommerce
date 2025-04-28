import { err, ok } from "@nimara/domain/objects/Result";

import type {
  PaymentProcessUseCase,
  PaymentResultProcessInfra,
  TransactionProcessInfra,
} from "../../payment/types.ts";

export const paymentResultProcessUseCase =
  ({
    paymentResultProcess,
    transactionProcess,
  }: {
    paymentResultProcess: PaymentResultProcessInfra;
    transactionProcess: TransactionProcessInfra;
  }): PaymentProcessUseCase =>
  async ({ checkout, searchParams }) => {
    const resultPaymentProcess = await paymentResultProcess({ checkout });

    if (!resultPaymentProcess.ok) {
      return err([
        {
          code: "CHECKOUT_NOT_PAID_ERROR",
        },
      ]);
    }

    if (resultPaymentProcess.data.isCheckoutPaid) {
      return ok({ success: true });
    }

    return transactionProcess({ searchParams });
  };
