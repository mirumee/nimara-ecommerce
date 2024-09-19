import type {
  CheckoutEmailUpdateInfra,
  CheckoutEmailUpdateUseCase,
} from "#root/public/saleor/checkout/types";

export const checkoutEmailUpdateUseCase = ({
  checkoutEmailUpdateInfra,
}: {
  checkoutEmailUpdateInfra: CheckoutEmailUpdateInfra;
}): CheckoutEmailUpdateUseCase => {
  return async ({ checkout, email }) => {
    if (checkout.email === email) {
      return {
        isSuccess: true,
      };
    }

    const { isSuccess, validationErrors, serverError } =
      await checkoutEmailUpdateInfra({
        checkout,
        email,
      });

    return {
      isSuccess,
      validationErrors,
      serverError,
    };
  };
};
