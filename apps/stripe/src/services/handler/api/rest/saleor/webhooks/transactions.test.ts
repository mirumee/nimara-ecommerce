import { beforeEach, describe, expect, it, vi } from "vitest";

import { err, ok } from "@nimara/domain/objects/Result";
import { type HandlerContext } from "@nimara/lib/hono/saleor/types";
import { MagicMock } from "@nimara/lib/test/mock";

import { type PaymentIntent } from "@/domain/consts";

import { transactionInitializeSessionHandler } from "./transactions";

const mocks = vi.hoisted(() => ({
  createPaymentIntent: vi.fn(),
  retrievePaymentMethodCustomerId: vi.fn(),
  paymentService: vi.fn(),
  resolveCustomer: vi.fn(),
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

vi.mock("@/container", () => ({
  container: {
    get: vi.fn((key: string) => {
      switch (key) {
        case "config":
          return { APP_ID: "TEST.stripe", ENVIRONMENT: "TEST" };
        case "paymentService":
          return mocks.paymentService;
        case "paymentMethodService":
          return { resolveCustomer: mocks.resolveCustomer };
        default:
          throw new Error(`Unexpected container key: ${key}`);
      }
    }),
  },
}));

const GATEWAY_CONFIG = {
  currency: "USD",
  publicKey: "pk_test_1",
  secretKey: "sk_test_1",
};

const USER = {
  email: "shopper@example.com",
  firstName: "Jo",
  id: "user_1",
  lastName: "Doe",
  privateMetadata: [],
};

const INTENT: PaymentIntent = {
  amount: 1000,
  clientSecret: "pi_1_secret",
  created: 1700000000,
  currency: "usd",
  id: "pi_1",
  lastErrorCode: null,
  reportAmount: 1000,
  status: "succeeded",
};

const buildEvent = ({
  data,
  user,
}: {
  data?: unknown;
  user?: typeof USER | null;
} = {}) => ({
  action: { actionType: "CHARGE", amount: 10, currency: "USD" },
  data,
  sourceObject: {
    channel: { slug: "default-channel" },
    shippingAddress: null,
    total: { gross: { amount: 1000, currency: "USD" } },
    user: user ?? null,
  },
  transaction: { id: "tr_1", pspReference: "pi_1" },
});

const TENANT = {
  saleorApiUrl: "https://shop.example.com/graphql/",
  saleorDomain: "shop.example.com",
};

const buildContext = (event: unknown) =>
  ({
    get: () => mocks.logger,
    req: { valid: () => event },
  }) as unknown as HandlerContext;

// The tenant is an argument, published by the middleware that verified the
// signature — never read off the payload.
const handle = (event: unknown) =>
  transactionInitializeSessionHandler(
    buildContext(event) as Parameters<
      typeof transactionInitializeSessionHandler
    >[0],
    TENANT,
  );

describe("transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.paymentService.mockResolvedValue(
      ok({
        config: GATEWAY_CONFIG,
        gateway: MagicMock({
          createPaymentIntent: mocks.createPaymentIntent,
          retrievePaymentMethodCustomerId:
            mocks.retrievePaymentMethodCustomerId,
        }),
      }),
    );
    mocks.createPaymentIntent.mockResolvedValue(ok(INTENT));
    mocks.resolveCustomer.mockResolvedValue(ok("cus_1"));
    mocks.retrievePaymentMethodCustomerId.mockResolvedValue(
      ok({ customerId: "cus_1" }),
    );
  });

  describe("transactionInitializeSessionHandler", () => {
    it("creates a customer-less intent for a guest", async () => {
      // when
      const response = await handle(buildEvent());

      // then
      expect(response.status).toBe(200);
      expect((await response.json()).result).toBe("CHARGE_SUCCESS");
      expect(mocks.resolveCustomer).not.toHaveBeenCalled();
      expect(mocks.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: null, saveForFutureUse: false }),
      );
    });

    it("attaches the resolved gateway user for a signed-in shopper", async () => {
      // when
      await handle(buildEvent({ user: USER }));

      // then
      expect(mocks.resolveCustomer).toHaveBeenCalledWith({
        channelSlug: "default-channel",
        saleorDomain: "shop.example.com",
        user: USER,
      });
      expect(mocks.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: "cus_1" }),
      );
    });

    it("proceeds without a gateway user when resolution fails on a plain payment", async () => {
      // given
      mocks.resolveCustomer.mockResolvedValue(
        err([{ code: "UNKNOWN_ERROR", message: "boom" }]),
      );

      // when
      const response = await handle(buildEvent({ user: USER }));

      // then
      expect(response.status).toBe(200);
      expect((await response.json()).result).toBe("CHARGE_SUCCESS");
      expect(mocks.logger.warning).toHaveBeenCalledWith(
        "Proceeding without a gateway user.",
        expect.objectContaining({ userId: USER.id }),
      );
      expect(mocks.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: null }),
      );
    });

    it("drops save for future use when resolution fails, without breaking the checkout", async () => {
      // given
      mocks.resolveCustomer.mockResolvedValue(
        err([{ code: "UNKNOWN_ERROR", message: "boom" }]),
      );

      // when
      const response = await handle(
        buildEvent({ user: USER, data: { saveForFutureUse: true } }),
      );

      // then
      expect(response.status).toBe(200);
      expect((await response.json()).result).toBe("CHARGE_SUCCESS");
      expect(mocks.logger.warning).toHaveBeenCalledWith(
        "Ignoring save for future use without a gateway user.",
        expect.objectContaining({ userId: USER.id }),
      );
      expect(mocks.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: null, saveForFutureUse: false }),
      );
    });

    it("honors save for future use when the gateway user resolves", async () => {
      // when
      await handle(
        buildEvent({ user: USER, data: { saveForFutureUse: true } }),
      );

      // then
      expect(mocks.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: "cus_1",
          saveForFutureUse: true,
        }),
      );
    });

    it("refuses a saved-method payment for a guest as a failure event", async () => {
      // when
      const response = await handle(
        buildEvent({ data: { paymentMethodId: "pm_1" } }),
      );

      // then
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        message: "Saved payment methods require a signed in customer.",
        result: "CHARGE_FAILURE",
      });
      expect(mocks.createPaymentIntent).not.toHaveBeenCalled();
    });

    it("refuses a saved-method payment when the gateway user cannot be resolved", async () => {
      // given
      mocks.resolveCustomer.mockResolvedValue(
        err([{ code: "UNKNOWN_ERROR", message: "boom" }]),
      );

      // when
      const response = await handle(
        buildEvent({ user: USER, data: { paymentMethodId: "pm_1" } }),
      );

      // then
      expect(await response.json()).toMatchObject({
        message: "Could not resolve the customer for this payment.",
        result: "CHARGE_FAILURE",
      });
      expect(mocks.createPaymentIntent).not.toHaveBeenCalled();
    });

    it("refuses an unknown saved method as a failure event", async () => {
      // given
      mocks.retrievePaymentMethodCustomerId.mockResolvedValue(ok(null));

      // when
      const response = await handle(
        buildEvent({ user: USER, data: { paymentMethodId: "pm_1" } }),
      );

      // then
      expect(await response.json()).toMatchObject({
        message: "Payment method does not exist.",
        result: "CHARGE_FAILURE",
      });
      expect(mocks.createPaymentIntent).not.toHaveBeenCalled();
    });

    it("refuses a saved method that belongs to another customer", async () => {
      // given
      mocks.retrievePaymentMethodCustomerId.mockResolvedValue(
        ok({ customerId: "cus_other" }),
      );

      // when
      const response = await handle(
        buildEvent({ user: USER, data: { paymentMethodId: "pm_1" } }),
      );

      // then
      expect(await response.json()).toMatchObject({
        message: "Payment method does not belong to this customer.",
        result: "CHARGE_FAILURE",
      });
      expect(mocks.createPaymentIntent).not.toHaveBeenCalled();
    });

    it("pays with an owned saved method", async () => {
      // when
      const response = await handle(
        buildEvent({ user: USER, data: { paymentMethodId: "pm_1" } }),
      );

      // then
      expect(response.status).toBe(200);
      expect((await response.json()).result).toBe("CHARGE_SUCCESS");
      expect(mocks.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: "cus_1",
          paymentMethodId: "pm_1",
        }),
      );
    });

    it("responds with the config error when the gateway cannot be resolved", async () => {
      // given
      mocks.paymentService.mockResolvedValue(
        err([
          {
            code: "SALEOR_APP_CONFIG_NOT_FOUND_ERROR",
            message: "Missing gateway config.",
            status: 422,
          },
        ]),
      );

      // when
      const response = await handle(buildEvent());

      // then
      expect(response.status).toBe(422);
      expect(mocks.createPaymentIntent).not.toHaveBeenCalled();
    });
  });
});
