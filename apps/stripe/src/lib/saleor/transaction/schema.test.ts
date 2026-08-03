import { describe, expect, it } from "vitest";

import { parseTransactionInitializeData } from "./schema";

describe("parseTransactionInitializeData", () => {
  it("should keep the intent options the app acts on", () => {
    // when
    const result = parseTransactionInitializeData({
      metadata: { orderNote: "gift" },
      paymentMethodId: "pm_1",
      saveForFutureUse: true,
      sharedPaymentToken: "spt_1",
    });

    // then
    expect(result).toEqual({
      metadata: { orderNote: "gift" },
      paymentMethodId: "pm_1",
      saveForFutureUse: true,
      sharedPaymentToken: "spt_1",
    });
  });

  it("should drop Stripe parameters the caller is not allowed to set", () => {
    // given
    const data = {
      amount: 1,
      confirm: true,
      customer: "cus_victim",
      off_session: true,
      on_behalf_of: "acct_attacker",
      payment_method: "pm_victim",
      transfer_data: { destination: "acct_attacker" },
    };

    // when
    const result = parseTransactionInitializeData(data);

    // then
    expect(result).toEqual({});
  });

  it.each([
    { description: "an absent payload", data: undefined },
    { description: "a null payload", data: null },
    { description: "a payload of the wrong shape", data: "not-an-object" },
    {
      description: "a payload with mistyped values",
      data: { paymentMethodId: 42 },
    },
  ])("should fall back to no options for $description", ({ data }) => {
    // when / then
    expect(parseTransactionInitializeData(data)).toEqual({});
  });
});
