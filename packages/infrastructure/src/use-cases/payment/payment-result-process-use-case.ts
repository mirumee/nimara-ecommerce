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
    const { isSuccess, errors } = await paymentResultProcess({ checkout });

    if (isSuccess) {
      return { isSuccess, errors };
    }

    return transactionProcess({ searchParams });
  };
