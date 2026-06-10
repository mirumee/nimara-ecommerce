import type { TrackAddPaymentInfoProvider } from "#root/use-cases/tracking/types/add-payment-info";
import type { TrackAddShippingInfoProvider } from "#root/use-cases/tracking/types/add-shipping-info";
import type { TrackAddToCartProvider } from "#root/use-cases/tracking/types/add-to-cart";
import type { TrackBeginCheckoutProvider } from "#root/use-cases/tracking/types/begin-checkout";
import type { TrackLoginProvider } from "#root/use-cases/tracking/types/login";
import type { TrackPurchaseProvider } from "#root/use-cases/tracking/types/purchase";
import type { TrackRemoveFromCartProvider } from "#root/use-cases/tracking/types/remove-from-cart";
import type { TrackSearchProvider } from "#root/use-cases/tracking/types/search";
import type { TrackSelectItemProvider } from "#root/use-cases/tracking/types/select-item";
import type { TrackSignUpProvider } from "#root/use-cases/tracking/types/sign-up";
import type { UpdateConsentProvider } from "#root/use-cases/tracking/types/update-consent";
import type { TrackViewCartProvider } from "#root/use-cases/tracking/types/view-cart";
import type { TrackViewItemProvider } from "#root/use-cases/tracking/types/view-item";
import type { TrackViewListItemProvider } from "#root/use-cases/tracking/types/view-list-item";

import { gtmTrackAddPaymentInfoInfra } from "./infrastructure/track-add-payment-info-infra";
import { gtmTrackAddShippingInfoInfra } from "./infrastructure/track-add-shipping-info-infra";
import { gtmTrackAddToCartInfra } from "./infrastructure/track-add-to-cart-infra";
import { gtmTrackBeginCheckoutInfra } from "./infrastructure/track-begin-checkout-infra";
import { gtmTrackLoginInfra } from "./infrastructure/track-login-infra";
import { gtmTrackPurchaseInfra } from "./infrastructure/track-purchase-infra";
import { gtmTrackRemoveFromCartInfra } from "./infrastructure/track-remove-from-cart-infra";
import { gtmTrackSearchInfra } from "./infrastructure/track-search-infra";
import { gtmTrackSelectItemInfra } from "./infrastructure/track-select-item-infra";
import { gtmTrackSignUpInfra } from "./infrastructure/track-sign-up-infra";
import { gtmTrackViewCartInfra } from "./infrastructure/track-view-cart-infra";
import { gtmTrackViewItemInfra } from "./infrastructure/track-view-item-infra";
import { gtmTrackViewListItemInfra } from "./infrastructure/track-view-list-item-infra";
import { gtmUpdateConsentInfra } from "./infrastructure/update-consent-infra";

/**
 * Single GTM tracking provider exposing one entry per event. All events
 * push to `window.dataLayer`; no shared config.
 */
export const gtmTrackingProvider = (): {
  addPaymentInfo: TrackAddPaymentInfoProvider;
  addShippingInfo: TrackAddShippingInfoProvider;
  addToCart: TrackAddToCartProvider;
  beginCheckout: TrackBeginCheckoutProvider;
  consent: UpdateConsentProvider;
  login: TrackLoginProvider;
  purchase: TrackPurchaseProvider;
  removeFromCart: TrackRemoveFromCartProvider;
  search: TrackSearchProvider;
  selectItem: TrackSelectItemProvider;
  signUp: TrackSignUpProvider;
  viewCart: TrackViewCartProvider;
  viewItem: TrackViewItemProvider;
  viewListItem: TrackViewListItemProvider;
} => ({
  addPaymentInfo: gtmTrackAddPaymentInfoInfra(),
  addShippingInfo: gtmTrackAddShippingInfoInfra(),
  addToCart: gtmTrackAddToCartInfra(),
  beginCheckout: gtmTrackBeginCheckoutInfra(),
  consent: gtmUpdateConsentInfra(),
  login: gtmTrackLoginInfra(),
  purchase: gtmTrackPurchaseInfra(),
  removeFromCart: gtmTrackRemoveFromCartInfra(),
  search: gtmTrackSearchInfra(),
  selectItem: gtmTrackSelectItemInfra(),
  signUp: gtmTrackSignUpInfra(),
  viewCart: gtmTrackViewCartInfra(),
  viewItem: gtmTrackViewItemInfra(),
  viewListItem: gtmTrackViewListItemInfra(),
});
