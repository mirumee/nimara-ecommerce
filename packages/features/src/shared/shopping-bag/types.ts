import { type AsyncResult } from "@nimara/domain/objects/Result";

export interface DiscountCodeActions {
  addPromoCode: (params: {
    checkoutId: string;
    promoCode: string;
  }) => AsyncResult<unknown>;
  removePromoCode: (params: {
    checkoutId: string;
    promoCode: string;
  }) => AsyncResult<unknown>;
}
