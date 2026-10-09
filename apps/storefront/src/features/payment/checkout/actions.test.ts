import { beforeEach, describe, expect, it, vi } from "vitest";

import { err, ok } from "@nimara/domain/objects/Result";

import { initializeMarketplacePayment } from "./actions";

const mocks = vi.hoisted(() => ({
  clientEnvs: { PAYMENT_APP_ID: "app.saleor.stripe" as string | undefined },
  paymentGroupFollowerInitialize: vi.fn(),
  paymentGroupLeaderInitialize: vi.fn(),
  paymentInitialize: vi.fn(),
}));

vi.mock("@/envs/client", () => ({ clientEnvs: mocks.clientEnvs }));

vi.mock("@nimara/foundation/address/address", () => ({
  schemaToAddress: vi.fn(),
}));

vi.mock("@/services/registry", () => ({
  getServiceRegistry: async () => ({
    getPaymentService: async () => ({
      paymentGroupFollowerInitialize: mocks.paymentGroupFollowerInitialize,
      paymentGroupLeaderInitialize: mocks.paymentGroupLeaderInitialize,
      paymentInitialize: mocks.paymentInitialize,
    }),
  }),
}));

vi.mock("@/services/logging", () => ({
  storefrontLogger: { error: vi.fn() },
}));

vi.mock("@/services/tokens", () => ({ getAccessToken: vi.fn() }));

vi.mock("@/foundation/address/create-address-action", () => ({
  createAddressAction: vi.fn(),
}));

vi.mock("@/foundation/checkout/actions/update-checkout-address-action", () => ({
  updateCheckoutAddressAction: vi.fn(),
}));

const SESSION = {
  gatewayConfig: { publishableKey: "pk_test_1" },
  providerData: { clientSecret: "pi_1_secret" },
  sessionId: "event_1",
  transaction: { id: "tr_a" },
};

const CHECKOUTS = [
  { amount: 15, checkoutId: "co_a", currency: "USD" },
  { amount: 30, checkoutId: "co_b", currency: "USD" },
  { amount: 5.5, checkoutId: "co_c", currency: "USD" },
];

describe("actions", () => {
  describe("initializeMarketplacePayment", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mocks.clientEnvs.PAYMENT_APP_ID = "app.saleor.stripe";
      mocks.paymentGroupFollowerInitialize.mockImplementation(
        async ({ id }: { id: string }) => ok({ id: `tr_${id.slice(3)}` }),
      );
      mocks.paymentGroupLeaderInitialize.mockResolvedValue(ok(SESSION));
      mocks.paymentInitialize.mockResolvedValue(ok(SESSION));
    });

    it("registers every follower before the leader opens the payment", async () => {
      const result = await initializeMarketplacePayment({
        checkouts: CHECKOUTS,
      });

      expect(result).toEqual(
        ok({ clientSecret: "pi_1_secret", publishableKey: "pk_test_1" }),
      );
      expect(mocks.paymentGroupFollowerInitialize.mock.calls).toEqual([
        [{ amount: 30, id: "co_b" }],
        [{ amount: 5.5, id: "co_c" }],
      ]);
      expect(mocks.paymentGroupLeaderInitialize).toHaveBeenCalledWith({
        amount: 15,
        followers: [
          { checkoutId: "co_b", transactionId: "tr_b" },
          { checkoutId: "co_c", transactionId: "tr_c" },
        ],
        id: "co_a",
      });
      expect(
        mocks.paymentGroupLeaderInitialize.mock.invocationCallOrder[0],
      ).toBeGreaterThan(
        Math.max(
          ...mocks.paymentGroupFollowerInitialize.mock.invocationCallOrder,
        ),
      );
    });

    it("pays a single checkout with a plain payment", async () => {
      const result = await initializeMarketplacePayment({
        checkouts: CHECKOUTS.slice(0, 1),
      });

      expect(result.ok).toBe(true);
      expect(mocks.paymentInitialize).toHaveBeenCalledWith({
        amount: 15,
        id: "co_a",
      });
      expect(mocks.paymentGroupLeaderInitialize).not.toHaveBeenCalled();
    });

    it("stops before the leader when a follower fails", async () => {
      mocks.paymentGroupFollowerInitialize.mockResolvedValueOnce(
        err([{ code: "TRANSACTION_INITIALIZE_ERROR" }]),
      );

      const result = await initializeMarketplacePayment({
        checkouts: CHECKOUTS,
      });

      expect(result).toEqual(err([{ code: "TRANSACTION_INITIALIZE_ERROR" }]));
      expect(mocks.paymentGroupLeaderInitialize).not.toHaveBeenCalled();
    });

    it("returns the leader failure", async () => {
      mocks.paymentGroupLeaderInitialize.mockResolvedValue(
        err([{ code: "TRANSACTION_INITIALIZE_ERROR" }]),
      );

      const result = await initializeMarketplacePayment({
        checkouts: CHECKOUTS,
      });

      expect(result).toEqual(err([{ code: "TRANSACTION_INITIALIZE_ERROR" }]));
    });

    it("refuses an empty checkout list", async () => {
      const result = await initializeMarketplacePayment({ checkouts: [] });

      expect(result).toEqual(err([{ code: "GENERIC_PAYMENT_ERROR" }]));
    });

    it("keeps the vendor API payment without a payment app", async () => {
      mocks.clientEnvs.PAYMENT_APP_ID = undefined;

      const result = await initializeMarketplacePayment({
        checkouts: CHECKOUTS,
      });

      expect(result).toEqual(err([{ code: "GENERIC_PAYMENT_ERROR" }]));
      expect(mocks.paymentGroupFollowerInitialize).not.toHaveBeenCalled();
      expect(mocks.paymentGroupLeaderInitialize).not.toHaveBeenCalled();
    });
  });
});
