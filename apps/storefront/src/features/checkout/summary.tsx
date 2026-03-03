"use client";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type Result } from "@nimara/domain/objects/Result";
import { ShoppingBag } from "@nimara/features/shared/shopping-bag/shopping-bag";

interface SummaryProps {
  addPromoCodeAction?: (params: {
    checkoutId: string;
    promoCode: string;
  }) => Promise<Result<{ success: boolean }>>;
  checkout: Checkout;
  removePromoCodeAction?: (params: {
    checkoutId: string;
    promoCode: string;
  }) => Promise<Result<{ success: boolean }>>;
}

export const Summary = ({
  checkout,
  addPromoCodeAction,
  removePromoCodeAction,
}: SummaryProps) => {
  return (
    <ShoppingBag>
      <ShoppingBag.Header totalPrice={checkout.totalPrice.gross} />
      <ShoppingBag.Lines
        lines={checkout.lines}
        isLinesEditable={false}
        problems={checkout.problems}
      />
      <ShoppingBag.DiscountCode
        checkout={checkout}
        addPromoCodeAction={addPromoCodeAction}
        removePromoCodeAction={removePromoCodeAction}
      />
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
