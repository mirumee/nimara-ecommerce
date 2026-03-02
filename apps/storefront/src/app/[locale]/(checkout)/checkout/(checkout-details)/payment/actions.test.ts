import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Checkout } from "@nimara/domain/objects/Checkout";

vi.mock("@/auth", () => ({
  getAccessToken: vi.fn(),
}));
vi.mock("@/lib/actions/update-checkout-address-action", () => ({
  updateCheckoutAddressAction: vi.fn(),
}));
vi.mock("@/services/user", () => ({
  getUserService: vi.fn(),
}));
vi.mock("@/lib/marketplace/poc-payments-client", () => ({
  checkoutCompleteMarketplace: vi.fn(),
  createMarketplacePaymentIntent: vi.fn(),
}));

import * as updateCheckoutAddressActionModule from "@/lib/actions/update-checkout-address-action";
import * as pocPaymentsClient from "@/lib/marketplace/poc-payments-client";

import { initializeMarketplacePayment, updateBillingAddress } from "./actions";

const createCheckout = ({
  shippingAddress,
}: {
  shippingAddress: Checkout["shippingAddress"];
}): Checkout =>
  ({
    authorizeStatus: "NONE",
    availablePaymentGateways: [],
    billingAddress: null,
    chargeStatus: "NONE",
    deliveryMethod: null,
    discount: null,
    displayGrossPrices: true,
    email: "buyer@example.com",
    id: "checkout-1",
    isShippingRequired: true,
    lines: [],
    problems: {
      insufficientStock: [],
      variantNotAvailable: [],
    },
    shippingAddress,
    shippingMethods: [],
    shippingPrice: {
      gross: { amount: 0, currency: "USD" },
      net: { amount: 0, currency: "USD" },
      tax: { amount: 0, currency: "USD" },
    },
    subtotalPrice: {
      gross: { amount: 0, currency: "USD" },
      net: { amount: 0, currency: "USD" },
      tax: { amount: 0, currency: "USD" },
    },
    totalPrice: {
      gross: { amount: 0, currency: "USD" },
      net: { amount: 0, currency: "USD" },
      tax: { amount: 0, currency: "USD" },
    },
    voucherCode: null,
  }) as Checkout;

describe("initializeMarketplacePayment", () => {
  const checkoutCompleteMarketplaceMock = vi.mocked(
    pocPaymentsClient.checkoutCompleteMarketplace,
  );
  const createMarketplacePaymentIntentMock = vi.mocked(
    pocPaymentsClient.createMarketplacePaymentIntent,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns client secret and order ids when checkout completion and payment intent succeed", async () => {
    checkoutCompleteMarketplaceMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        completedOrders: [
          {
            amount: 30,
            currency: "USD",
            orderId: "order-1",
            orderNumber: "1",
            sourceCheckoutId: "checkout-1",
          },
          {
            amount: 20,
            currency: "USD",
            orderId: "order-2",
            orderNumber: "2",
            sourceCheckoutId: "checkout-2",
          },
        ],
        failedCheckouts: [],
      },
    });
    createMarketplacePaymentIntentMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        amount: 5000,
        clientSecret: "pi_secret",
        currency: "usd",
        orders: [
          { orderId: "order-1", amount: 30, currency: "USD" },
          { orderId: "order-2", amount: 20, currency: "USD" },
        ],
        paymentIntentId: "pi_123",
        transferGroup: "tg_123",
      },
    });

    const result = await initializeMarketplacePayment({
      checkoutIds: ["checkout-1", "checkout-2", "checkout-1"],
      buyerId: "buyer-1",
    });

    expect(checkoutCompleteMarketplaceMock).toHaveBeenCalledOnce();
    expect(checkoutCompleteMarketplaceMock).toHaveBeenCalledWith([
      "checkout-1",
      "checkout-2",
    ]);
    expect(createMarketplacePaymentIntentMock).toHaveBeenCalledOnce();
    expect(createMarketplacePaymentIntentMock).toHaveBeenCalledWith({
      buyerId: "buyer-1",
      orders: [
        { orderId: "order-1", amount: 30, currency: "USD" },
        { orderId: "order-2", amount: 20, currency: "USD" },
      ],
    });
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data).toEqual({
        clientSecret: "pi_secret",
        orderIds: ["order-1", "order-2"],
      });
    }
  });

  it("returns error and does not initialize payment intent when checkout completion is partial", async () => {
    checkoutCompleteMarketplaceMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        completedOrders: [
          {
            amount: 30,
            currency: "USD",
            orderId: "order-1",
            orderNumber: "1",
            sourceCheckoutId: "checkout-1",
          },
        ],
        failedCheckouts: [
          {
            checkoutId: "checkout-2",
            code: "CHECKOUT_COMPLETE_ERROR",
            message: "failure",
          },
        ],
      },
    });

    const result = await initializeMarketplacePayment({
      checkoutIds: ["checkout-1", "checkout-2"],
      buyerId: "buyer-1",
    });

    expect(result.ok).toBe(false);
    expect(createMarketplacePaymentIntentMock).not.toHaveBeenCalled();

    if (!result.ok) {
      expect(result.errors[0]?.code).toBe("CHECKOUT_COMPLETE_ERROR");
    }
  });

  it("returns error and does not initialize payment intent for mixed currencies", async () => {
    checkoutCompleteMarketplaceMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        completedOrders: [
          {
            amount: 30,
            currency: "USD",
            orderId: "order-1",
            orderNumber: "1",
            sourceCheckoutId: "checkout-1",
          },
          {
            amount: 20,
            currency: "EUR",
            orderId: "order-2",
            orderNumber: "2",
            sourceCheckoutId: "checkout-2",
          },
        ],
        failedCheckouts: [],
      },
    });

    const result = await initializeMarketplacePayment({
      checkoutIds: ["checkout-1", "checkout-2"],
      buyerId: "buyer-1",
    });

    expect(result.ok).toBe(false);
    expect(createMarketplacePaymentIntentMock).not.toHaveBeenCalled();

    if (!result.ok) {
      expect(result.errors[0]?.code).toBe("CHECKOUT_COMPLETE_ERROR");
    }
  });

  it("returns transaction initialize error when payment intent creation fails", async () => {
    checkoutCompleteMarketplaceMock.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        completedOrders: [
          {
            amount: 30,
            currency: "USD",
            orderId: "order-1",
            orderNumber: "1",
            sourceCheckoutId: "checkout-1",
          },
        ],
        failedCheckouts: [],
      },
    });
    createMarketplacePaymentIntentMock.mockResolvedValue({
      ok: false,
      status: 500,
      data: {
        amount: 3000,
        clientSecret: "",
        currency: "usd",
        orders: [{ orderId: "order-1", amount: 30, currency: "USD" }],
        paymentIntentId: "",
        transferGroup: "",
      },
    });

    const result = await initializeMarketplacePayment({
      checkoutIds: ["checkout-1"],
      buyerId: "buyer-1",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors[0]?.code).toBe("TRANSACTION_INITIALIZE_ERROR");
    }
  });

  it("returns checkout not found error when no checkout ids are provided", async () => {
    const result = await initializeMarketplacePayment({
      checkoutIds: [],
      buyerId: "buyer-1",
    });

    expect(result.ok).toBe(false);
    expect(checkoutCompleteMarketplaceMock).not.toHaveBeenCalled();
    expect(createMarketplacePaymentIntentMock).not.toHaveBeenCalled();

    if (!result.ok) {
      expect(result.errors[0]?.code).toBe("CHECKOUT_NOT_FOUND_ERROR");
    }
  });
});

describe("updateBillingAddress", () => {
  const updateCheckoutAddressActionMock = vi.mocked(
    updateCheckoutAddressActionModule.updateCheckoutAddressAction,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns controlled error when sameAsShippingAddress is true and shipping address is missing", async () => {
    const result = await updateBillingAddress({
      checkout: createCheckout({ shippingAddress: null }),
      input: {
        sameAsShippingAddress: true,
        saveAddressForFutureUse: false,
        billingAddress: undefined,
      },
    });

    expect(result.ok).toBe(false);
    expect(updateCheckoutAddressActionMock).not.toHaveBeenCalled();

    if (!result.ok) {
      expect(result.errors[0]?.code).toBe(
        "CHECKOUT_BILLING_ADDRESS_UPDATE_ERROR",
      );
    }
  });
});
