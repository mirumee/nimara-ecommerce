"use client";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { ShoppingBag } from "@nimara/features/shared/shopping-bag/shopping-bag";

export const Summary = ({ checkout }: { checkout: Checkout }) => {
  return (
    <ShoppingBag>
      <ShoppingBag.Header totalPrice={checkout.totalPrice.gross} />
      <ShoppingBag.Lines
        lines={checkout.lines}
        isLinesEditable={false}
        problems={checkout.problems}
      />
      <ShoppingBag.DiscountCode checkout={checkout} />
      <ShoppingBag.Pricing>
        <ShoppingBag.Subtotal price={checkout.subtotalPrice.gross} />
        <ShoppingBag.Shipping
          price={checkout.shippingPrice.gross}
          isShippingSelected={!!checkout.deliveryMethod}
          isShippingRequired={checkout.isShippingRequired}
        />
        {!!checkout?.discount?.amount && (
          <ShoppingBag.Discount discount={checkout.discount} />
        )}
        <ShoppingBag.Total price={checkout.totalPrice.gross} />
      </ShoppingBag.Pricing>
    </ShoppingBag>
  );
};

Summary.displayName = "Summary";
