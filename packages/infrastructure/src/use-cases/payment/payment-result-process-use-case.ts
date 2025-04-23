import { err, ok } from "@nimara/domain/objects/Result";

import type {
  PaymentProcessUseCase,
  PaymentResultProcessInfra,
  TransactionProcessInfra,
} from "#root/public/stripe/payment/types";

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

    if (resultPaymentProcess.ok) {
      if (resultPaymentProcess.data.isCheckoutPaid) {
        return ok({ success: true });
      }

      return err([
        {
          code: "CHECKOUT_NOT_PAID_ERROR",
        },
      ]);
    }

    return transactionProcess({ searchParams });
  };
