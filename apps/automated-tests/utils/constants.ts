type Channel = "gb" | "us";

export const CHECKOUT_STEPS = [
  "user-details",
  "shipping-address",
  "delivery-method",
  "payment",
] as const;

export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

export const checkoutStepUrl = (step: string, channel: Channel = "gb") =>
  `${channel}/checkout?step=${step}`;

export const URLS = (channel: Channel = "gb") =>
  ({
    CART_PAGE: `${channel}/cart`,
    CHECKOUT_PAGE: `${channel}/checkout`,
    CHECKOUT_PAGE_USER_DETAILS: checkoutStepUrl("user-details", channel),
    CHECKOUT_PAGE_SHIPPING_ADDRESS: checkoutStepUrl(
      "shipping-address",
      channel,
    ),
    CHECKOUT_PAGE_DELIVERY_METHOD: checkoutStepUrl("delivery-method", channel),
    CHECKOUT_PAGE_PAYMENT: checkoutStepUrl("payment", channel),
    ORDER_CONFIRMATION_PAGE: `${channel}/order/confirmation/*`,
    CHECKOUT_PAGE_SIGN_IN: `${channel}/checkout/sign-in`,
    HOME_PAGE: `${channel}`,
    SIGN_IN_PAGE: `${channel}/sign-in`,
    SIGN_IN_PAGE_RESULT: `${channel}?loggedIn=`,
    RESET_PASSWORD: `${channel}/reset-password`,
    CREATE_ACCOUNT: `${channel}/create-account`,
    PRODUCTS_PAGE: `${channel}/search`,
    PRODUCT_PAGE: `${channel}/products`,
    CATEGORY_PAGE: `${channel}/categories`,
  }) as const;

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

/**
 * A product the checkout raises no shipping for, so its checkout skips the
 * shipping steps. Leave `url` empty to skip the coverage that needs one.
 */
export const digitalProduct = {
  url: "nowhere-digital",
};

export type DigitalProduct = typeof digitalProduct;

export const storeHeaders = {
  heroBanner: "Power your store with Nimara",
  productsCarousel: "Nimara's products",
  productsCarouselDescription:
    "See what Nimara Store has to offer in the storefront demo version.",
  newsletter: "Subscribe to Newsletter",
  productListingPage: "All Nimara’s best products",
};

export const storeParagraphs = {
  newsletter:
    "Subscribe to our newsletter and be the first to get updates on new products and promotions.",
  newsletterConfirmationNotice:
    "We will email you a confirmation link. Your subscription starts once you confirm it.",
  newsletterConsentRequired:
    "Please agree to receive marketing emails before subscribing.",
  newsletterSubscribeSuccess:
    "Almost done. Check your inbox and confirm your subscription to finish.",
};
export type Product = typeof product;

export const category = {
  slug: "music",
  name: "Music",
};

export type Category = typeof category;

export const user = {
  email: "test@mirumee.com",
  name: "John",
  lastName: "Doe",
  companyName: "Mirumee",
  phone: "20 8759 9036",
  streetAddress: "17 Wern Ddu Lane",
  postCode: "PE8 6FZ",
  city: "Lutton",
};

export type User = typeof user;

export const userEmail = process.env.USER_EMAIL ?? "";
export const userPassword = process.env.USER_PASSWORD ?? "";

export const paymentDetails = {
  cardNumber: "4242424242424242",
  expiryDate: `12/${(new Date().getFullYear() + 1).toString().substring(2)}`,
  cvc: "123",
};

export type PaymentDetails = typeof paymentDetails;
