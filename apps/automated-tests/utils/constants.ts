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
    PRODUCTS_PAGE: `${channel}/search`,
    PRODUCT_PAGE: `${channel}/products`,
  }) as const;

export const product = {
  url: "automated-test-product-ocean-waves#UHJvZHVjdFZhcmlhbnQ6ODM0",
  quantity: 1,
  deliveryMethod: {
    amount: 4,
    currency: "GBP",
    name: "DHL Fast",
  },
  price: {
    amount: 9.99,
    currency: "GBP",
  },
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
  expiryDate: `12/${new Date().getFullYear() + 1}`,
  cvc: "123",
};
