import { gtmTrackingProvider } from "#root/tracking/google/provider";
import { createTrackingUseCase } from "#root/use-cases/tracking/create-tracking-use-case";
import type { TrackAddPaymentInfoInput } from "#root/use-cases/tracking/types/add-payment-info";
import type { TrackAddShippingInfoInput } from "#root/use-cases/tracking/types/add-shipping-info";
import type { TrackAddToCartInput } from "#root/use-cases/tracking/types/add-to-cart";
import type { TrackBeginCheckoutInput } from "#root/use-cases/tracking/types/begin-checkout";
import type { TrackLoginInput } from "#root/use-cases/tracking/types/login";
import type { TrackPurchaseInput } from "#root/use-cases/tracking/types/purchase";
import type { TrackRemoveFromCartInput } from "#root/use-cases/tracking/types/remove-from-cart";
import type { TrackSearchInput } from "#root/use-cases/tracking/types/search";
import type { TrackSelectItemInput } from "#root/use-cases/tracking/types/select-item";
import type { TrackSignUpInput } from "#root/use-cases/tracking/types/sign-up";
import type { UpdateConsentInput } from "#root/use-cases/tracking/types/update-consent";
import type { TrackViewCartInput } from "#root/use-cases/tracking/types/view-cart";
import type { TrackViewItemInput } from "#root/use-cases/tracking/types/view-item";
import type { TrackViewListItemInput } from "#root/use-cases/tracking/types/view-list-item";

/**
 * Composes per-event tracking use-cases bound to the GTM provider.
 *
 * GTM events always push to `window.dataLayer` (no-op on the server);
 * downstream consent filtering is delegated to Google Consent Mode v2 in the
 * GTM container, preserving GA4 cookieless conversion modelling.
 * `updateConsent` is never gated.
 *
 * Additional providers (e.g. Algolia Insights for search attribution) can be
 * added per event — see the routing note in
 * `./../use-cases/tracking/types/provider`.
 */
export const getTrackingService = () => {
  const gtm = gtmTrackingProvider();

  return {
    /**
     * Fired on any add to cart action.
     */
    trackAddToCart: createTrackingUseCase<TrackAddToCartInput>({
      providers: [gtm.addToCart],
    }),
    /**
     * Fired when certain view list is shown: PLP, categories, carousels etc.
     */
    trackViewListItem: createTrackingUseCase<TrackViewListItemInput>({
      providers: [gtm.viewListItem],
    }),
    /**
     * Fired on product detail page view.
     */
    trackViewItem: createTrackingUseCase<TrackViewItemInput>({
      providers: [gtm.viewItem],
    }),
    /**
     * Fired when shopping cart is viewed.
     */
    trackViewCart: createTrackingUseCase<TrackViewCartInput>({
      providers: [gtm.viewCart],
    }),
    /**
     * Fired when a line is removed from the cart.
     */
    trackRemoveFromCart: createTrackingUseCase<TrackRemoveFromCartInput>({
      providers: [gtm.removeFromCart],
    }),
    /**
     * Fired when a purchase is completed.
     */
    trackPurchase: createTrackingUseCase<TrackPurchaseInput>({
      providers: [gtm.purchase],
    }),
    /**
     * Fired when a product is selected from a list (PLP, carousel, search results).
     */
    trackSelectItem: createTrackingUseCase<TrackSelectItemInput>({
      providers: [gtm.selectItem],
    }),
    /**
     * Fired when a search query produces results.
     */
    trackSearch: createTrackingUseCase<TrackSearchInput>({
      providers: [gtm.search],
    }),
    /**
     * Fired on successful user login.
     */
    trackLogin: createTrackingUseCase<TrackLoginInput>({
      providers: [gtm.login],
    }),
    /**
     * Fired on successful account creation.
     */
    trackSignUp: createTrackingUseCase<TrackSignUpInput>({
      providers: [gtm.signUp],
    }),
    /**
     * Fired when the user begins checkout.
     */
    trackBeginCheckout: createTrackingUseCase<TrackBeginCheckoutInput>({
      providers: [gtm.beginCheckout],
    }),
    /**
     * Fired after shipping info is submitted in checkout.
     */
    trackAddShippingInfo: createTrackingUseCase<TrackAddShippingInfoInput>({
      providers: [gtm.addShippingInfo],
    }),
    /**
     * Fired after payment info is submitted in checkout.
     */
    trackAddPaymentInfo: createTrackingUseCase<TrackAddPaymentInfoInput>({
      providers: [gtm.addPaymentInfo],
    }),
    /**
     * Pushes Google Consent Mode v2 `update` signal so GTM tags respect
     * the new categories without a full reload. Called from the cookie
     * banner and settings dialog after the consent cookie is written.
     */
    updateConsent: createTrackingUseCase<UpdateConsentInput>({
      providers: [gtm.consent],
    }),
  };
};

export type TrackingService = ReturnType<typeof getTrackingService>;
