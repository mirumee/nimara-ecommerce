import { beforeEach, describe, expect, it, vi } from "vitest";

import { err, ok } from "@nimara/domain/objects/Result";
import { MagicMock } from "@nimara/lib/test/mock";

import { type StripeGateway } from "@/infrastructure/payment/stripe/gateway";

import { resolvePaymentCustomer } from "./payment-customer";

const mocks = vi.hoisted(() => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
  resolveCustomer: vi.fn(),
  retrievePaymentMethodCustomerId: vi.fn(),
}));

vi.mock("@/container", () => ({
  container: {
    get: vi.fn(() => ({ resolveCustomer: mocks.resolveCustomer })),
  },
}));

const USER = {
  email: "shopper@example.com",
  firstName: "Jo",
  id: "user_1",
  lastName: "Doe",
  privateMetadata: [],
};

const resolve = (
  overrides: Partial<Parameters<typeof resolvePaymentCustomer>[0]> = {},
) =>
  resolvePaymentCustomer({
    channelSlug: "default-channel",
    gateway: MagicMock<StripeGateway>({
      retrievePaymentMethodCustomerId: mocks.retrievePaymentMethodCustomerId,
    }),
    logger: mocks.logger as never,
    saleorDomain: "shop.example.com",
    transactionId: "tr_1",
    user: USER,
    ...overrides,
  });

describe("payment-customer", () => {
  describe("resolvePaymentCustomer", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mocks.resolveCustomer.mockResolvedValue(ok("cus_1"));
      mocks.retrievePaymentMethodCustomerId.mockResolvedValue(
        ok({ customerId: "cus_1" }),
      );
    });

    it("pays a guest without a gateway customer", async () => {
      expect(await resolve({ user: null })).toEqual({
        customerId: null,
        ok: true,
        saveForFutureUse: false,
      });
      expect(mocks.resolveCustomer).not.toHaveBeenCalled();
    });

    it("attaches the gateway customer and keeps the save wish", async () => {
      expect(await resolve({ saveForFutureUse: true })).toEqual({
        customerId: "cus_1",
        ok: true,
        saveForFutureUse: true,
      });
    });

    it("drops the save wish of a guest", async () => {
      expect(await resolve({ saveForFutureUse: true, user: null })).toEqual({
        customerId: null,
        ok: true,
        saveForFutureUse: false,
      });
    });

    it("continues without a customer when resolution fails", async () => {
      mocks.resolveCustomer.mockResolvedValue(
        err([{ code: "UNKNOWN_ERROR", message: "boom" }]),
      );

      expect(await resolve()).toEqual({
        customerId: null,
        ok: true,
        saveForFutureUse: false,
      });
    });

    it("accepts an owned saved method", async () => {
      expect(await resolve({ paymentMethodId: "pm_1" })).toMatchObject({
        customerId: "cus_1",
        ok: true,
      });
    });

    it.each([
      [
        "a guest uses a saved method",
        () => {},
        { user: null },
        "Saved payment methods require a signed in customer.",
      ],
      [
        "the customer cannot be resolved",
        () => {
          mocks.resolveCustomer.mockResolvedValue(
            err([{ code: "UNKNOWN_ERROR", message: "boom" }]),
          );
        },
        {},
        "Could not resolve the customer for this payment.",
      ],
      [
        "the saved method does not exist",
        () => {
          mocks.retrievePaymentMethodCustomerId.mockResolvedValue(ok(null));
        },
        {},
        "Payment method does not exist.",
      ],
      [
        "the saved method belongs to another customer",
        () => {
          mocks.retrievePaymentMethodCustomerId.mockResolvedValue(
            ok({ customerId: "cus_other" }),
          );
        },
        {},
        "Payment method does not belong to this customer.",
      ],
    ])("refuses when %s", async (_, arrange, overrides, refusal) => {
      arrange();

      expect(await resolve({ paymentMethodId: "pm_1", ...overrides })).toEqual({
        ok: false,
        refusal,
      });
    });

    it("returns the gateway error when the method cannot be read", async () => {
      const errors: [{ code: "UNKNOWN_ERROR"; message: string }] = [
        { code: "UNKNOWN_ERROR", message: "down" },
      ];

      mocks.retrievePaymentMethodCustomerId.mockResolvedValue(err(errors));

      expect(await resolve({ paymentMethodId: "pm_1" })).toEqual({
        errors,
        ok: false,
      });
    });
  });
});
