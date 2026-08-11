import { locate } from "codeceptjs";

import { LOCALE_PREFIX } from "../data/locales";

export const timeout_seconds = 8; // timeout for wait funtions used in tests

export const URLS = {
  CART_PAGE: `${LOCALE_PREFIX}/cart`,
  CHECKOUT_PAGE_USER_DETAILS: `${LOCALE_PREFIX}/checkout?step=user-details`,
  CHECKOUT_PAGE_SHIPPING_ADDRESS: `${LOCALE_PREFIX}/checkout?step=shipping-address`,
  CHECKOUT_PAGE_DELIVERY_METHOD: `${LOCALE_PREFIX}/checkout?step=delivery-method`,
  CHECKOUT_PAGE_PAYMENT: `${LOCALE_PREFIX}/checkout?step=payment`,
  ORDER_CONFIRMATION_PAGE: `${LOCALE_PREFIX}/order/confirmation/*`,
  CHECKOUT_PAGE_SIGN_IN: `${LOCALE_PREFIX}/checkout/sign-in`,
  HOME_PAGE: `${LOCALE_PREFIX}`,
  SIGN_IN_PAGE: `${LOCALE_PREFIX}/sign-in`,
  SIGN_IN_PAGE_RESULT: `${LOCALE_PREFIX}?loggedIn=`,
  RESET_PASSWORD: `${LOCALE_PREFIX}/reset-password`,
  CREATE_ACCOUNT: `${LOCALE_PREFIX}/create-account`,
  PRODUCTS_PAGE: `${LOCALE_PREFIX}/search`,
  PRODUCT_PAGE: `${LOCALE_PREFIX}/products`,
  CATEGORY_PAGE: `${LOCALE_PREFIX}/categories`,
  TSHIRT_PRODUCT_PAGE: `${LOCALE_PREFIX}/products/abstract-tshirt-black`,
} as const;

/*
export const product = {
  url: "automated-test-product-ocean-waves?format-album=vinyl",
  quantity: 1,
  deliveryMethod: {
    amount: 4,
    currency: "GBP",
    name: "DHL Fast",
  },
  price: {
    amount: 21.99,
    currency: "GBP",
  },
};
*/

export const tshirtImagelocator = locate("img").withAttr({
  "aria-label": "Abstract Tshirt Ultra Black",
});

export const storeHeaders = {
  heroBanner: "Power your store with Nimara",
  productsCarousel: "Nimara's products",
  productsCarouselDescription:
    "See what Nimara Store has to offer in the storefront demo version.",
  newsletter: "Subscribe to Newsletter",
  productListingPage: "All Nimara’s best products",
  cookiePopup: "We use cookies",
  cookieAccept: "Accept all",
  orderSuccess: "Your order has been successfully placed",
};

export const storeParagraphs = {
  newsletter:
    "Subscribe to our newsletter and be the first to get updates on new products and promotions.",
};
//export type Product = typeof product;

export const category = {
  slug: "music",
  name: "Music",
};

export type Category = typeof category;

export const userGB = {
  email: "test@mirumee.com",
  name: "John",
  lastName: "Doe",
  companyName: "Mirumee",
  phone: "20 8759 9036",
  streetAddress: "17 Wern Ddu Lane",
  postCode: "PE8 6FZ",
  city: "Lutton",
};

export const userUS = {
  email: "test@example.com",
  name: "John",
  lastName: "Doe",
  companyName: "Mirumee",
  phone: "(212)555-0000",
  streetAddress: "123 Main St",
  postCode: "93721",
  city: "Fresno",
};

export type User = typeof userGB | typeof userUS;

export const userEmail = process.env.USER_EMAIL ?? "";
export const userPassword = process.env.USER_PASSWORD ?? "";

export const paymentDetailsSUCCESS = {
  cardNumber: "4242424242424242",
  expiryDate: `12/${(new Date().getFullYear() + 1).toString().substring(2)}`,
  cvc: "123",
};

export type PaymentDetails = typeof paymentDetailsSUCCESS;
