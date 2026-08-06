import { type CheckoutShippingAddress_checkout_Checkout_shippingAddress_Address } from "@/graphql/generated/client";
import { checkoutService } from "@/services/checkouts";

const toIntentShipping = (
  address: CheckoutShippingAddress_checkout_Checkout_shippingAddress_Address | null,
) => {
  const name = [address?.firstName, address?.lastName]
    .filter(Boolean)
    .join(" ");

  if (!address || !name) {
    return undefined;
  }

  return {
    address: {
      city: address.city,
      country: address.country.code,
      line1: address.streetAddress1,
      line2: address.streetAddress2,
      postal_code: address.postalCode,
      state: address.countryArea,
    },
    name,
    ...(address.phone && { phone: address.phone }),
  };
};

/**
 * Stripe picks the payment methods it offers by customer country, which it
 * takes from the intent shipping address and only then from the client IP.
 */
export const resolveIntentShipping = async ({
  checkoutId,
  token,
}: {
  checkoutId: string;
  token?: string | null;
}) => {
  const result = await checkoutService.getShippingAddress(
    { id: checkoutId },
    token,
  );

  if (!result.ok) {
    return undefined;
  }

  return toIntentShipping(result.data.checkout?.shippingAddress ?? null);
};
