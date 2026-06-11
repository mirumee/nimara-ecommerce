import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { err, ok } from "@nimara/domain/objects/Result";
import type { AddressService } from "@nimara/infrastructure/address/types";
import type { CartService } from "@nimara/infrastructure/cart/types";
import type { CheckoutService } from "@nimara/infrastructure/checkout/types";
import type { CollectionService } from "@nimara/infrastructure/collection/types";
import type { MarketplaceService } from "@nimara/infrastructure/marketplace/types";
import type { StripePaymentService } from "@nimara/infrastructure/payment/providers";
import type { StoreService } from "@nimara/infrastructure/store/types";
import type { CMSMenuService } from "@nimara/infrastructure/use-cases/cms-menu/types";
import type { CMSPageService } from "@nimara/infrastructure/use-cases/cms-page/types";
import type {
  PageInfo,
  SearchService,
} from "@nimara/infrastructure/use-cases/search/types";
import type { UserService } from "@nimara/infrastructure/user/types";

import { clientEnvs } from "@/envs/client";

/**
 * Zero-config flag. When the Saleor API URL is not set, the storefront runs in a
 * "no backend" mode: every service resolves to an empty implementation (below)
 * instead of throwing, so all pages render with empty data rather than crashing.
 *
 * @see ./required-env.ts for the (still used) hard requirement helpers.
 */
export const isSaleorConfigured = Boolean(
  clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
);

const NOT_CONFIGURED_MESSAGE =
  "Saleor API is not configured. Set NEXT_PUBLIC_SALEOR_API_URL to enable this feature.";

/** Builds an error Result used by mutations / fetches that have no empty payload. */
const notConfigured = (code: AppErrorCode) =>
  err([{ code, message: NOT_CONFIGURED_MESSAGE }]);

const emptyCursorPageInfo: PageInfo = {
  type: "cursor",
  hasNextPage: false,
  hasPreviousPage: false,
  after: null,
  before: null,
};

export const emptyCMSMenuService = {
  menuGet: async () => ok(null),
} satisfies CMSMenuService;

export const emptyCMSPageService = {
  cmsPageGet: async () => ok(null),
} satisfies CMSPageService;

export const emptySearchService = {
  search: async () => ok({ pageInfo: emptyCursorPageInfo, results: [] }),
  getFacets: async () => ok([]),
  // Synchronous by contract — must NOT be async.
  getSortByOptions: () => ok([]),
} satisfies SearchService;

export const emptyStoreService = {
  getProductBase: async () => ok({ product: null }),
  getProductRelatedProducts: async () => ok({ products: null }),
  getProductDetails: async () => notConfigured("NOT_FOUND_ERROR"),
} satisfies StoreService;

export const emptyCollectionService = {
  getCollectionDetails: async () =>
    ok({ pageInfo: emptyCursorPageInfo, results: null }),
  getCollectionsIDsBySlugs: async () => ok([]),
} satisfies CollectionService;

export const emptyCartService = {
  cartGet: async () => notConfigured("CART_NOT_FOUND_ERROR"),
  linesAdd: async () => notConfigured("CART_LINES_ADD_ERROR"),
  linesUpdate: async () => notConfigured("CART_LINES_UPDATE_ERROR"),
  linesDelete: async () => notConfigured("CART_LINES_DELETE_ERROR"),
} satisfies CartService;

export const emptyCheckoutService = {
  checkoutAddPromoCode: async () => notConfigured("CHECKOUT_NOT_FOUND_ERROR"),
  checkoutBillingAddressUpdate: async () =>
    notConfigured("CHECKOUT_NOT_FOUND_ERROR"),
  checkoutCustomerAttach: async () => notConfigured("CHECKOUT_NOT_FOUND_ERROR"),
  checkoutEmailUpdate: async () => notConfigured("CHECKOUT_NOT_FOUND_ERROR"),
  checkoutGet: async () => notConfigured("CHECKOUT_NOT_FOUND_ERROR"),
  checkoutRemovePromoCode: async () =>
    notConfigured("CHECKOUT_NOT_FOUND_ERROR"),
  checkoutShippingAddressUpdate: async () =>
    notConfigured("CHECKOUT_NOT_FOUND_ERROR"),
  deliveryMethodUpdate: async () => notConfigured("CHECKOUT_NOT_FOUND_ERROR"),
  orderCreate: async () => notConfigured("CHECKOUT_NOT_FOUND_ERROR"),
} satisfies CheckoutService;

export const emptyUserService = {
  userGet: async () => ok(null),
  addressesGet: async () => ok([]),
  ordersGet: async () => ok([]),
  userFind: async () => notConfigured("UNKNOWN_ERROR"),
  accountUpdate: async () => notConfigured("ACCOUNT_UPDATE_ERROR"),
  accountDelete: async () => notConfigured("ACCOUNT_DELETE_ERROR"),
  accountRequestDeletion: async () =>
    notConfigured("ACCOUNT_REQUEST_DELETION_ERROR"),
  accountAddressCreate: async () => notConfigured("ADDRESS_CREATE_ERROR"),
  accountAddressDelete: async () => notConfigured("ADDRESS_DELETE_ERROR"),
  accountAddressUpdate: async () => notConfigured("ADDRESS_UPDATE_ERROR"),
  accountSetDefaultAddress: async () =>
    notConfigured("ADDRESS_SET_DEFAULT_ERROR"),
  passwordChange: async () => notConfigured("PASSWORD_CHANGE_ERROR"),
  requestEmailChange: async () => notConfigured("EMAIL_CHANGE_REQUEST_ERROR"),
  confirmEmailChange: async () =>
    notConfigured("EMAIL_CHANGE_CONFIRMATION_ERROR"),
} satisfies UserService;

export const emptyAddressService = {
  countriesGet: async () => ok([]),
  countriesAllGet: async () => ok([]),
  addressFormGetRows: async () => ok([]),
  addressFormat: async () => ok({ formattedAddress: [] }),
} satisfies AddressService;

export const emptyMarketplaceService = {
  vendorGetByID: async () => ok(null),
  vendorGetBySlug: async () => notConfigured("NOT_FOUND_ERROR"),
} satisfies MarketplaceService;

export const emptyPaymentService = {
  customerGet: async () => notConfigured("CHECKOUT_GATEWAY_CUSTOMER_GET_ERROR"),
  customerPaymentMethodDelete: async () =>
    notConfigured("PAYMENT_METHOD_NOT_FOUND_ERROR"),
  customerPaymentMethodsList: async () => ok([]),
  // Not Result-based by contract — returns a detached element handle.
  paymentElementCreate: async () => ({
    mount: () => {},
    unmount: () => {},
  }),
  paymentExecute: async () => notConfigured("PAYMENT_EXECUTE_ERROR"),
  paymentGatewayInitialize: async () =>
    notConfigured("PAYMENT_GATEWAY_INITIALIZE_ERROR"),
  paymentGatewayTransactionInitialize: async () =>
    notConfigured("PAYMENT_GATEWAY_INITIALIZE_ERROR"),
  // Void by contract — nothing to initialize without a gateway.
  paymentInitialize: async () => {},
  paymentMethodSaveExecute: async () =>
    notConfigured("PAYMENT_METHOD_SAVE_ERROR"),
  paymentMethodSaveInitialize: async () =>
    notConfigured("PAYMENT_METHOD_SAVE_ERROR"),
  paymentMethodSaveProcess: async () =>
    notConfigured("PAYMENT_METHOD_SAVE_ERROR"),
  paymentResultProcess: async () => notConfigured("PAYMENT_PROCESSING_ERROR"),
} satisfies StripePaymentService;
