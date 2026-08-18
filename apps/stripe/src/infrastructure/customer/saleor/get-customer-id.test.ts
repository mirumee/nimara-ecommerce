import { describe, expect, it } from "vitest";

import { getCustomerIdInfra } from "./get-customer-id";

describe("get-customer-id", () => {
  const user = {
    email: "shopper@example.com",
    id: "user_1",
    privateMetadata: [
      { key: "stripe.customer.default-channel.acct_1", value: "cus_default" },
      { key: "stripe.customer.other-channel.acct_1", value: "cus_other" },
    ],
  };

  const get = ({
    accountId,
    channelSlug,
  }: {
    accountId: string;
    channelSlug: string;
  }) => getCustomerIdInfra({ accountId, channelSlug })({ user });

  it("should read the gateway user id scoped to the channel and account", async () => {
    // when / then
    await expect(
      get({ accountId: "acct_1", channelSlug: "default-channel" }),
    ).resolves.toBe("cus_default");
  });

  it("should return null when the channel has no stored gateway user", async () => {
    // when / then
    await expect(
      get({ accountId: "acct_1", channelSlug: "unknown-channel" }),
    ).resolves.toBeNull();
  });

  /**
   * A gateway user id only exists in the Stripe account that created it, so a
   * channel whose account changed must not resolve the old mapping.
   */
  it("should return null when the account behind the channel changed", async () => {
    // when / then
    await expect(
      get({ accountId: "acct_2", channelSlug: "default-channel" }),
    ).resolves.toBeNull();
  });
});
