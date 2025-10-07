import { type CheckoutSessionFragment } from "#root/mcp/saleor/graphql/fragments/generated";
import { type CheckoutSession, checkoutSessionSchema } from "#root/mcp/schema";

export const validateAndSerializeCheckout = (
  checkout: CheckoutSessionFragment,
): CheckoutSession | null => {
  try {
    const parsedCheckout = checkoutSessionSchema.safeParse({
      id: checkout.id,
      currency: checkout.totalPrice.currency.toLowerCase(),
      fulfillment_options: [],
      line_items: checkout.lines.map((line) => ({
        id: line.id,
        quantity: line.quantity,
      })),
      messages: [],
      status: "not_ready_for_payment",
      totals: [],
      buyer: checkout.user
        ? {
            email: checkout.user.email,
            first_name: checkout.user.firstName ?? "MISSING_FIRST_NAME",
            last_name: checkout.user.lastName ?? "MISSING_LAST_NAME",
            phone_number: "MISSING_PHONE",
          }
        : null,
    } satisfies CheckoutSession);

    if (!parsedCheckout.success) {
      console.error("Failed to parse checkout", {
        errors: parsedCheckout.error.errors,
        checkout,
      });

      return null;
    }

    return parsedCheckout.data;
  } catch (e) {
    console.error("Failed to parse checkout", { error: e });

    return null;
  }
};
