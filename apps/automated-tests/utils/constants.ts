type Channel = "gb" | "us";

export const URLS = (channel: Channel = "gb") =>
  ({
    CART_PAGE: `${channel}/cart`,
    CHECKOUT_PAGE_USER_DETAILS: `${channel}/checkout/user-details`,
    CHECKOUT_PAGE_SHIPPING_ADDRESS: `${channel}/checkout/shipping-address`,
    CHECKOUT_PAGE_DELIVERY_METHOD: `${channel}/checkout/delivery-method`,
    CHECKOUT_PAGE_PAYMENT: `${channel}/checkout/payment`,
    ORDER_CONFIRMATION_PAGE: `${channel}/order/confirmation/*`,
    CHECKOUT_PAGE_SIGN_IN: `${channel}/checkout/sign-in`,
    HOME_PAGE: `${channel}`,
    SIGN_IN_PAGE: `${channel}/sign-in`,
    SIGN_IN_PAGE_RESULT: `${channel}?loggedIn=`,
    RESET_PASSWORD: `${channel}/reset-password`,
    CREATE_ACCOUNT: `${channel}/create-account`,
    PRODUCTS_PAGE: `${channel}/search`,
    PRODUCT_PAGE: `${channel}/products`,
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

export const storeHeaders = {
  heroBanner: "Welcome to Nimara Store",
  productsCarousel: "Nimara's products",
  productsCarouselDescription:
    "See what Nimara Store has to offer in the storefront demo version.",
  newsletter: "Subscribe to Newsletter",
  productListingPage: "All Nimara’s best products",
};

export const storeParagraphs = {
  newsletter:
    "Subscribe to our newsletter and be the first to get updates on new products and promotions.",
};
export type Product = typeof product;

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
