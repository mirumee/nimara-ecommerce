import { describe, expect, it } from "vitest";

import {
  findGroupShare,
  getGroupShareAvailableActions,
  isGroupShareEventType,
  isPaymentGroup,
  parseGroupShares,
  sumGroupShares,
  toGroupShareMetadata,
} from "./payment-group";

describe("payment-group", () => {
  describe("isPaymentGroup", () => {
    it("recognizes the group marker", () => {
      expect(isPaymentGroup({ paymentGroup: "1" })).toBe(true);
    });

    it("rejects metadata without the marker", () => {
      expect(isPaymentGroup({ transactionId: "tr_1" })).toBe(false);
    });
  });

  describe("parseGroupShares", () => {
    it("reads every share with its transaction and amount", () => {
      expect(
        parseGroupShares({
          paymentGroup: "1",
          transactionId: "tr_a",
          tx_0: "tr_a|1500",
          tx_1: "tr_b|3000",
        }),
      ).toEqual([
        { transactionId: "tr_a", amount: 1500 },
        { transactionId: "tr_b", amount: 3000 },
      ]);
    });

    it("rejects metadata without shares", () => {
      expect(parseGroupShares({ paymentGroup: "1" })).toBeNull();
    });

    it.each([
      ["a value without an amount", "tr_a"],
      ["a non-numeric amount", "tr_a|ten"],
      ["a zero amount", "tr_a|0"],
      ["a missing transaction", "|1500"],
    ])("rejects %s", (_, value) => {
      expect(parseGroupShares({ tx_0: value, tx_1: "tr_b|3000" })).toBeNull();
    });

    it("rejects a transaction listed twice", () => {
      expect(
        parseGroupShares({ tx_0: "tr_a|1500", tx_1: "tr_a|1500" }),
      ).toBeNull();
    });
  });

  describe("sumGroupShares", () => {
    it("adds share amounts", () => {
      expect(
        sumGroupShares([
          { transactionId: "tr_a", amount: 1500 },
          { transactionId: "tr_b", amount: 3000 },
        ]),
      ).toBe(4500);
    });
  });

  describe("isGroupShareEventType", () => {
    it.each([
      "CHARGE_SUCCESS",
      "CHARGE_REQUEST",
      "CHARGE_FAILURE",
      "CANCEL_SUCCESS",
    ] as const)("reports %s", (type) => {
      expect(isGroupShareEventType(type)).toBe(true);
    });

    it.each([
      "CHARGE_ACTION_REQUIRED",
      "REFUND_SUCCESS",
      "AUTHORIZATION_ADJUSTMENT",
    ] as const)("does not report %s", (type) => {
      expect(isGroupShareEventType(type)).toBe(false);
    });
  });

  describe("getGroupShareAvailableActions", () => {
    it("offers refund on a charged share", () => {
      expect(getGroupShareAvailableActions("CHARGE_SUCCESS")).toEqual([
        "REFUND",
      ]);
    });

    it("offers nothing on any other share event", () => {
      expect(getGroupShareAvailableActions("CHARGE_FAILURE")).toEqual([]);
    });
  });

  describe("toGroupShareMetadata", () => {
    it("marks the group and lists every share in order", () => {
      expect(
        toGroupShareMetadata([
          { transactionId: "tr_a", amount: 1500 },
          { transactionId: "tr_b", amount: 3000 },
        ]),
      ).toEqual({ paymentGroup: "1", tx_0: "tr_a|1500", tx_1: "tr_b|3000" });
    });

    it("round-trips through parseGroupShares", () => {
      const shares = [
        { transactionId: "tr_a", amount: 1500 },
        { transactionId: "tr_b", amount: 3000 },
      ];

      expect(parseGroupShares(toGroupShareMetadata(shares))).toEqual(shares);
    });
  });

  describe("findGroupShare", () => {
    const metadata = { tx_0: "tr_a|1500", tx_1: "tr_b|3000" };

    it("finds the share of a listed transaction", () => {
      expect(findGroupShare({ metadata, transactionId: "tr_b" })).toEqual({
        transactionId: "tr_b",
        amount: 3000,
      });
    });

    it("returns null for a transaction outside the group", () => {
      expect(findGroupShare({ metadata, transactionId: "tr_c" })).toBeNull();
    });
  });
});
