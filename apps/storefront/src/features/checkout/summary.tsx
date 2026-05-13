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
  hidePromoCode?: boolean;
  /**
   * The mode of the checkout. Determines which summary UI to display.
   * - "standard": Single checkout with promo code support
   * - "marketplace": Aggregated multi-vendor checkout
   */
  mode?: "standard" | "marketplace";
  removePromoCodeAction?: (params: {
    checkoutId: string;
    promoCode: string;
  }) => Promise<Result<{ success: boolean }>>;
  vendorIdNames?: Record<string, string>;
}

export const Summary = ({
  checkout,
  addPromoCodeAction,
  removePromoCodeAction,
  hidePromoCode = false,
  mode = "standard",
  vendorIdNames,
}: SummaryProps) => {
  return (
    <ShoppingBag>
      <ShoppingBag.Header totalPrice={checkout.totalPrice.gross} />
      <ShoppingBag.Lines
        vendorIdNames={vendorIdNames}
        lines={checkout.lines}
        isLinesEditable={false}
        problems={checkout.problems}
        isMarketplaceEnabled={mode === "marketplace"}
      />
      {!hidePromoCode && (
        <ShoppingBag.DiscountCode
          checkout={checkout}
          addPromoCodeAction={addPromoCodeAction}
          removePromoCodeAction={removePromoCodeAction}
        />
      )}
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
