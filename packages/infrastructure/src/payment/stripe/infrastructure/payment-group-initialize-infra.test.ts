import { beforeEach, describe, expect, it, vi } from "vitest";

import { ok } from "@nimara/domain/objects/Result";

import {
  paymentGroupFollowerInitializeInfra,
  paymentGroupLeaderInitializeInfra,
} from "./payment-group-initialize-infra";

const mocks = vi.hoisted(() => ({ execute: vi.fn() }));

vi.mock("#root/graphql/client", () => ({
  graphqlClient: () => ({ execute: mocks.execute }),
}));

const CONFIG = {
  apiURI: "https://shop.example.com/graphql/",
  gatewayAppId: "app.stripe",
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
} as unknown as Parameters<typeof paymentGroupLeaderInitializeInfra>[0];

const initializeResponse = (data: unknown = null) =>
  ok({
    transactionInitialize: {
      data,
      errors: [],
      transaction: { id: "tr_leader" },
      transactionEvent: {
        id: "event_1",
        message: "",
        type: "CHARGE_ACTION_REQUIRED",
      },
    },
  });

const SESSION_DATA = {
  paymentIntent: { clientSecret: "pi_1_secret", publishableKey: "pk_test_1" },
};

const FOLLOWERS = [{ checkoutId: "co_b", transactionId: "tr_b" }];

const variablesOf = (call = 0) => mocks.execute.mock.calls[call][1].variables;

describe("payment-group-initialize-infra", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("paymentGroupFollowerInitializeInfra", () => {
    it("registers a follower with a stable idempotency key", async () => {
      mocks.execute.mockResolvedValue(initializeResponse());

      const follow = paymentGroupFollowerInitializeInfra(CONFIG);
      const result = await follow({ amount: 30, id: "co_b" });

      await follow({ amount: 30, id: "co_b" });

      expect(result).toEqual(ok({ id: "tr_leader" }));
      expect(variablesOf(0)).toMatchObject({
        amount: 30,
        data: { paymentGroup: { role: "follower" } },
        id: "co_b",
      });
      expect(variablesOf(0).idempotencyKey).toMatch(
        /^payment-group-follower-[0-9a-f]{64}$/,
      );
      expect(variablesOf(1).idempotencyKey).toBe(variablesOf(0).idempotencyKey);
    });
  });

  describe("paymentGroupLeaderInitializeInfra", () => {
    beforeEach(() => {
      mocks.execute.mockResolvedValue(initializeResponse(SESSION_DATA));
    });

    it("opens the group session with the follower transactions", async () => {
      const result = await paymentGroupLeaderInitializeInfra(CONFIG)({
        amount: 15,
        followers: FOLLOWERS,
        id: "co_a",
      });

      expect(result).toEqual(
        ok({
          gatewayConfig: { publishableKey: "pk_test_1" },
          providerData: { clientSecret: "pi_1_secret" },
          sessionId: "event_1",
          transaction: { id: "tr_leader" },
        }),
      );
      expect(variablesOf().data).toEqual({
        paymentGroup: { role: "leader", followers: FOLLOWERS },
      });
      expect(variablesOf().idempotencyKey).toMatch(
        /^payment-group-leader-[0-9a-f]{64}$/,
      );
    });

    it("changes the idempotency key with the save choice", async () => {
      const lead = paymentGroupLeaderInitializeInfra(CONFIG);

      await lead({ amount: 15, followers: FOLLOWERS, id: "co_a" });
      await lead({
        amount: 15,
        followers: FOLLOWERS,
        id: "co_a",
        saveForFutureUse: true,
      });

      expect(variablesOf(1).data).toMatchObject({ saveForFutureUse: true });
      expect(variablesOf(1).idempotencyKey).not.toBe(
        variablesOf(0).idempotencyKey,
      );
    });

    it("fails when the leader returns no session", async () => {
      mocks.execute.mockResolvedValue(initializeResponse());

      const result = await paymentGroupLeaderInitializeInfra(CONFIG)({
        amount: 15,
        followers: FOLLOWERS,
        id: "co_a",
      });

      expect(result.ok).toBe(false);
    });

    it("fails when the leader is refused", async () => {
      mocks.execute.mockResolvedValue(
        ok({
          transactionInitialize: {
            data: null,
            errors: [],
            transaction: { id: "tr_leader" },
            transactionEvent: {
              id: "event_1",
              message: "A payment group checkout is already paid.",
              type: "CHARGE_FAILURE",
            },
          },
        }),
      );

      const result = await paymentGroupLeaderInitializeInfra(CONFIG)({
        amount: 15,
        followers: FOLLOWERS,
        id: "co_a",
      });

      expect(result.ok).toBe(false);
    });
  });
});
