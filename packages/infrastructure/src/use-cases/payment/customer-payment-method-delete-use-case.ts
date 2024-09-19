import type {
  CustomerPaymentMethodDeleteUseCase,
  CustomerPaymentMethodValidate,
  PaymentMethodDetachInfra,
} from "#root/public/stripe/payment/types";

export const customerPaymentMethodDeleteUseCase =
  ({
    paymentMethodDetach,
    customerPaymentMethodValidate,
  }: {
    customerPaymentMethodValidate: CustomerPaymentMethodValidate;
    paymentMethodDetach: PaymentMethodDetachInfra;
  }): CustomerPaymentMethodDeleteUseCase =>
  async ({ customerId, paymentMethodId }) => {
    const { isCustomerPaymentMethod } = await customerPaymentMethodValidate({
      customerId,
      paymentMethodId,
    });

    if (!isCustomerPaymentMethod) {
      return { isSuccess: false };
    }

    await paymentMethodDetach({ paymentMethodId });

    return { isSuccess: true };
  };
