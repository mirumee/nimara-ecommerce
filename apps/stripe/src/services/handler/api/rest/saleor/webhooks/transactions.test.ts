import { beforeEach, describe, expect, it, vi } from "vitest";

import { err, ok } from "@nimara/domain/objects/Result";
import { type HandlerContext } from "@nimara/lib/hono/saleor/types";
import { MagicMock } from "@nimara/lib/test/mock";

import { type PaymentIntent } from "@/domain/consts";

import {
  transactionInitializeSessionHandler,
  transactionProcessSessionHandler,
} from "./transactions";

const mocks = vi.hoisted(() => ({
  createPaymentIntent: vi.fn(),
  getAppId: vi.fn(),
  getGroupCheckout: vi.fn(),
  retrievePaymentIntent: vi.fn(),
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
        case "appConfigService":
          return {
            getBySaleorDomain: async () => ok({ authToken: "token" }),
          };
        case "saleorClient":
          return () => ({
            getAppId: mocks.getAppId,
            getGroupCheckout: mocks.getGroupCheckout,
          });
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
  metadata: {},
  reportAmount: 1000,
  status: "succeeded",
};

const buildEvent = ({
  action,
  data,
  user,
}: {
  action?: { actionType?: string; amount?: number; currency?: string };
  data?: unknown;
  user?: typeof USER | null;
} = {}) => ({
  action: { actionType: "CHARGE", amount: 10, currency: "USD", ...action },
  data,
  sourceObject: {
    id: "co_1",
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

const handleProcess = (event: unknown) =>
  transactionProcessSessionHandler(
    buildContext(event) as Parameters<
      typeof transactionProcessSessionHandler
    >[0],
    TENANT,
  );

const FOLLOWER_ACTION = { amount: 1000 };

const APP_ID = "app_1";

const groupCheckout = ({
  id,
  total,
  transactions = [],
  ...overrides
}: {
  authorizeStatus?: string;
  channel?: { slug: string };
  chargeStatus?: string;
  email?: string | null;
  id: string;
  total: number;
  transactions?: unknown[];
  user?: { id: string } | null;
}) => ({
  authorizeStatus: "NONE",
  channel: { slug: "default-channel" },
  chargeStatus: "NONE",
  email: "shopper@example.com",
  id,
  totalPrice: { gross: { amount: total, currency: "USD" } },
  transactions,
  user: null,
  ...overrides,
});

const followerTransaction = ({
  id,
  amount,
  ...overrides
}: {
  amount: number;
  chargedAmount?: { amount: number; currency: string };
  createdBy?: { id: string } | null;
  id: string;
  pspReference?: string;
}) => ({
  chargedAmount: { amount: 0, currency: "USD" },
  createdBy: { id: APP_ID },
  events: [
    { amount: { amount, currency: "USD" }, type: "CHARGE_REQUEST" },
    { amount: { amount, currency: "USD" }, type: "CHARGE_ACTION_REQUIRED" },
  ],
  id,
  pspReference: "",
  ...overrides,
});

let GROUP_CHECKOUTS: Record<string, unknown> = {};

const LEADER_DATA = {
  paymentGroup: {
    role: "leader",
    followers: [
      { checkoutId: "co_2", transactionId: "tr_2" },
      { checkoutId: "co_3", transactionId: "tr_3" },
    ],
  },
};

const VALID_GROUP = () => ({
  co_1: groupCheckout({ id: "co_1", total: 1000 }),
  co_2: groupCheckout({
    id: "co_2",
    total: 30,
    transactions: [followerTransaction({ id: "tr_2", amount: 30 })],
  }),
  co_3: groupCheckout({
    id: "co_3",
    total: 5.5,
    transactions: [followerTransaction({ id: "tr_3", amount: 5.5 })],
  }),
});

describe("transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    GROUP_CHECKOUTS = VALID_GROUP();

    mocks.paymentService.mockResolvedValue(
      ok({
        config: GATEWAY_CONFIG,
        gateway: MagicMock({
          createPaymentIntent: mocks.createPaymentIntent,
          retrievePaymentIntent: mocks.retrievePaymentIntent,
          retrievePaymentMethodCustomerId:
            mocks.retrievePaymentMethodCustomerId,
        }),
      }),
    );
    mocks.createPaymentIntent.mockResolvedValue(ok(INTENT));
    mocks.retrievePaymentIntent.mockResolvedValue(ok(INTENT));
    mocks.getAppId.mockResolvedValue(ok(APP_ID));
    mocks.getGroupCheckout.mockImplementation(async (id: string) =>
      ok(GROUP_CHECKOUTS[id] ?? null),
    );
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

    it("keeps client metadata from overriding or adding reserved keys", async () => {
      await handle(
        buildEvent({
          data: {
            metadata: {
              channelSlug: "other-channel",
              environment: "PROD",
              issuer: "OTHER.stripe",
              orderNote: "gift",
              paymentGroup: "1",
              saleorDomain: "evil.example.com",
              transactionId: "tr_other",
              tx_0: "tr_other|100",
            },
          },
        }),
      );

      expect(mocks.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            channelSlug: "default-channel",
            environment: "TEST",
            issuer: "TEST.stripe",
            orderNote: "gift",
            saleorDomain: "shop.example.com",
            transactionId: "tr_1",
          },
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

    describe("payment group", () => {
      it("registers a follower without creating a PaymentIntent", async () => {
        const response = await handle(
          buildEvent({
            action: FOLLOWER_ACTION,
            data: { paymentGroup: { role: "follower" } },
            user: USER,
          }),
        );

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
          amount: "1000.00",
          result: "CHARGE_ACTION_REQUIRED",
        });
        expect(mocks.createPaymentIntent).not.toHaveBeenCalled();
        expect(mocks.resolveCustomer).not.toHaveBeenCalled();
      });

      it.each([
        [
          "the group is malformed",
          buildEvent({
            action: FOLLOWER_ACTION,
            data: { paymentGroup: { role: "owner" } },
          }),
          "Invalid payment group.",
        ],
        [
          "the action is an authorization",
          buildEvent({
            action: { ...FOLLOWER_ACTION, actionType: "AUTHORIZATION" },
            data: { paymentGroup: { role: "follower" } },
          }),
          "Group payments support charge only.",
        ],
        [
          "the amount differs from the checkout total",
          buildEvent({
            action: { amount: 999.99 },
            data: { paymentGroup: { role: "follower" } },
          }),
          "Payment amount does not match the checkout total.",
        ],
      ])("refuses when %s", async (_, event, message) => {
        const response = await handle(event);

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({
          message,
          result: `${event.action.actionType}_FAILURE`,
        });
        expect(mocks.createPaymentIntent).not.toHaveBeenCalled();
      });

      describe("leader", () => {
        const leaderEvent = () =>
          buildEvent({ action: FOLLOWER_ACTION, data: LEADER_DATA });

        beforeEach(() => {
          LEADER_DATA.paymentGroup.followers[1].checkoutId = "co_3";
          mocks.createPaymentIntent.mockResolvedValue(
            ok({
              ...INTENT,
              amount: 103550,
              status: "requires_payment_method",
            }),
          );
        });

        it("creates one PaymentIntent for the whole group and answers its own share", async () => {
          const response = await handle(leaderEvent());

          expect(response.status).toBe(200);
          expect(await response.json()).toMatchObject({
            amount: "1000.00",
            data: { paymentIntent: { clientSecret: "pi_1_secret" } },
            pspReference: "pi_1",
            result: "CHARGE_ACTION_REQUIRED",
          });
          expect(mocks.createPaymentIntent).toHaveBeenCalledWith({
            amount: 103550,
            captureMethod: "automatic",
            currency: "USD",
            customerId: null,
            idempotencyKey: expect.stringMatching(
              /^payment-group-[0-9a-f]{64}$/,
            ),
            metadata: {
              channelSlug: "default-channel",
              environment: "TEST",
              issuer: "TEST.stripe",
              paymentGroup: "1",
              saleorDomain: "shop.example.com",
              transactionId: "tr_1",
              tx_0: "tr_1|100000",
              tx_1: "tr_2|3000",
              tx_2: "tr_3|550",
            },
            paymentMethodId: undefined,
            saveForFutureUse: false,
          });
          expect(mocks.resolveCustomer).not.toHaveBeenCalled();
        });

        describe("saved payment methods", () => {
          const signedInLeaderEvent = (data: Record<string, unknown> = {}) =>
            buildEvent({
              action: FOLLOWER_ACTION,
              data: { ...LEADER_DATA, ...data },
              user: USER,
            });

          beforeEach(() => {
            GROUP_CHECKOUTS = Object.fromEntries(
              Object.entries(VALID_GROUP()).map(([id, checkout]) => [
                id,
                { ...checkout, user: { id: USER.id } },
              ]),
            );
          });

          const idempotencyKeyOf = (call: number) =>
            mocks.createPaymentIntent.mock.calls[call][0].idempotencyKey;

          it("pays the group with an owned saved method", async () => {
            const response = await handle(
              signedInLeaderEvent({ paymentMethodId: "pm_1" }),
            );

            expect(await response.json()).toMatchObject({
              result: "CHARGE_ACTION_REQUIRED",
            });
            expect(mocks.createPaymentIntent).toHaveBeenCalledWith(
              expect.objectContaining({
                customerId: "cus_1",
                paymentMethodId: "pm_1",
              }),
            );
          });

          it("saves a new method for a signed-in buyer", async () => {
            await handle(signedInLeaderEvent({ saveForFutureUse: true }));

            expect(mocks.createPaymentIntent).toHaveBeenCalledWith(
              expect.objectContaining({
                customerId: "cus_1",
                saveForFutureUse: true,
              }),
            );
          });

          it("ignores the save wish of a guest", async () => {
            GROUP_CHECKOUTS = VALID_GROUP();

            await handle(
              buildEvent({
                action: FOLLOWER_ACTION,
                data: { ...LEADER_DATA, saveForFutureUse: true },
              }),
            );

            expect(mocks.createPaymentIntent).toHaveBeenCalledWith(
              expect.objectContaining({
                customerId: null,
                saveForFutureUse: false,
              }),
            );
          });

          it("pays without a gateway user when resolution fails", async () => {
            mocks.resolveCustomer.mockResolvedValue(
              err([{ code: "UNKNOWN_ERROR", message: "boom" }]),
            );

            await handle(signedInLeaderEvent());

            expect(mocks.createPaymentIntent).toHaveBeenCalledWith(
              expect.objectContaining({ customerId: null }),
            );
          });

          it.each([
            [
              "a guest pays with a saved method",
              () => {
                GROUP_CHECKOUTS = VALID_GROUP();
              },
              buildEvent({
                action: FOLLOWER_ACTION,
                data: { ...LEADER_DATA, paymentMethodId: "pm_1" },
              }),
              "Saved payment methods require a signed in customer.",
            ],
            [
              "the saved method belongs to another customer",
              () => {
                mocks.retrievePaymentMethodCustomerId.mockResolvedValue(
                  ok({ customerId: "cus_other" }),
                );
              },
              signedInLeaderEvent({ paymentMethodId: "pm_1" }),
              "Payment method does not belong to this customer.",
            ],
            [
              "the saved method does not exist",
              () => {
                mocks.retrievePaymentMethodCustomerId.mockResolvedValue(
                  ok(null),
                );
              },
              signedInLeaderEvent({ paymentMethodId: "pm_1" }),
              "Payment method does not exist.",
            ],
          ])("refuses when %s", async (_, arrange, event, message) => {
            arrange();

            const response = await handle(event);

            expect(await response.json()).toMatchObject({
              amount: "1000.00",
              message,
              result: "CHARGE_FAILURE",
            });
            expect(mocks.createPaymentIntent).not.toHaveBeenCalled();
          });

          it("derives a different idempotency key for every payment choice", async () => {
            await handle(signedInLeaderEvent());
            await handle(signedInLeaderEvent({ saveForFutureUse: true }));
            await handle(signedInLeaderEvent({ paymentMethodId: "pm_1" }));

            expect(new Set([0, 1, 2].map(idempotencyKeyOf)).size).toBe(3);
          });
        });

        it("reuses the idempotency key for the same group", async () => {
          await handle(leaderEvent());
          await handle(leaderEvent());

          const [first, second] = mocks.createPaymentIntent.mock.calls.map(
            ([options]) => options.idempotencyKey,
          );

          expect(first).toBe(second);
        });

        it.each([
          [
            "a follower checkout does not exist",
            () => {
              delete GROUP_CHECKOUTS.co_3;
            },
            "A payment group checkout does not exist.",
          ],
          [
            "a checkout is listed twice",
            () => {
              LEADER_DATA.paymentGroup.followers[1].checkoutId = "co_1";
            },
            "A payment group lists a checkout more than once.",
          ],
          [
            "another app created the follower transaction",
            () => {
              GROUP_CHECKOUTS.co_2 = groupCheckout({
                id: "co_2",
                total: 30,
                transactions: [
                  followerTransaction({
                    id: "tr_2",
                    amount: 30,
                    createdBy: { id: "app_other" },
                  }),
                ],
              });
            },
            "A payment group transaction is missing.",
          ],
          [
            "the follower transaction already has a PaymentIntent",
            () => {
              GROUP_CHECKOUTS.co_2 = groupCheckout({
                id: "co_2",
                total: 30,
                transactions: [
                  followerTransaction({
                    id: "tr_2",
                    amount: 30,
                    pspReference: "pi_old",
                  }),
                ],
              });
            },
            "A payment group transaction is already used.",
          ],
          [
            "the follower checkout total changed",
            () => {
              GROUP_CHECKOUTS.co_2 = groupCheckout({
                id: "co_2",
                total: 31,
                transactions: [followerTransaction({ id: "tr_2", amount: 30 })],
              });
            },
            "A payment group transaction does not match its checkout total.",
          ],
          [
            "a follower checkout is already paid",
            () => {
              GROUP_CHECKOUTS.co_3 = groupCheckout({
                chargeStatus: "FULL",
                id: "co_3",
                total: 5.5,
                transactions: [
                  followerTransaction({ id: "tr_3", amount: 5.5 }),
                ],
              });
            },
            "A payment group checkout is already paid.",
          ],
          [
            "the leader checkout is already paid",
            () => {
              GROUP_CHECKOUTS.co_1 = groupCheckout({
                chargeStatus: "PARTIAL",
                id: "co_1",
                total: 1000,
              });
            },
            "A payment group checkout is already paid.",
          ],
          [
            "a follower is in another channel",
            () => {
              GROUP_CHECKOUTS.co_2 = groupCheckout({
                channel: { slug: "other-channel" },
                id: "co_2",
                total: 30,
                transactions: [followerTransaction({ id: "tr_2", amount: 30 })],
              });
            },
            "Payment group checkouts must share a channel and currency.",
          ],
          [
            "a follower belongs to another customer",
            () => {
              GROUP_CHECKOUTS.co_2 = groupCheckout({
                email: "someone@example.com",
                id: "co_2",
                total: 30,
                transactions: [followerTransaction({ id: "tr_2", amount: 30 })],
              });
            },
            "Payment group checkouts must belong to the same customer.",
          ],
          [
            "the app is not active",
            () => {
              mocks.getAppId.mockResolvedValue(ok(null));
            },
            "The payment application is not active.",
          ],
        ])("refuses when %s", async (_, arrange, message) => {
          arrange();

          const response = await handle(leaderEvent());

          expect(await response.json()).toMatchObject({
            amount: "1000.00",
            message,
            result: "CHARGE_FAILURE",
          });
          expect(mocks.createPaymentIntent).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe("transactionProcessSessionHandler", () => {
    const GROUP_INTENT: PaymentIntent = {
      ...INTENT,
      amount: 103550,
      metadata: {
        paymentGroup: "1",
        transactionId: "tr_1",
        tx_0: "tr_1|100000",
        tx_1: "tr_2|3000",
      },
    };

    it("answers a group member with its own share and never updates the intent", async () => {
      mocks.retrievePaymentIntent.mockResolvedValue(ok(GROUP_INTENT));

      const response = await handleProcess({
        ...buildEvent({ action: { amount: 30 }, data: { amount: 1 } }),
        transaction: { id: "tr_2", pspReference: "pi_1" },
      });

      expect(await response.json()).toMatchObject({
        amount: "30.00",
        pspReference: "pi_1",
        result: "CHARGE_SUCCESS",
      });
    });

    it("keeps a transaction outside the group waiting for action", async () => {
      mocks.retrievePaymentIntent.mockResolvedValue(ok(GROUP_INTENT));

      const response = await handleProcess({
        ...buildEvent({ action: { amount: 30 } }),
        transaction: { id: "tr_9", pspReference: "pi_1" },
      });

      expect(await response.json()).toEqual({
        amount: "30.00",
        result: "CHARGE_ACTION_REQUIRED",
      });
    });

    it("keeps a transaction without a PaymentIntent waiting for action", async () => {
      const response = await handleProcess({
        ...buildEvent({ action: FOLLOWER_ACTION }),
        transaction: { id: "tr_1", pspReference: "" },
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        amount: "1000.00",
        result: "CHARGE_ACTION_REQUIRED",
      });
      expect(mocks.paymentService).not.toHaveBeenCalled();
    });
  });
});
