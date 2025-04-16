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
      return resultPaymentProcess;
    }

    return transactionProcess({ searchParams });
  };
