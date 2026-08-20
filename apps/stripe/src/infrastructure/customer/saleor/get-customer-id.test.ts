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

  /**
   * Public metadata is shopper-writable, so a mapping planted there must never
   * resolve. Nothing in the type stops a caller passing it through, which is
   * why this is asserted rather than left to the shape of the payload.
   */
  describe("public metadata", () => {
    const getWithPublicMetadata = ({
      accountId,
      channelSlug,
      publicMetadata,
    }: {
      accountId: string;
      channelSlug: string;
      publicMetadata: { key: string; value: string }[];
    }) =>
      getCustomerIdInfra({ accountId, channelSlug })({
        user: { ...user, publicMetadata } as typeof user,
      });

    it("should ignore a mapping planted in public metadata", async () => {
      // when / then
      await expect(
        getWithPublicMetadata({
          accountId: "acct_1",
          channelSlug: "unknown-channel",
          publicMetadata: [
            {
              key: "stripe.customer.unknown-channel.acct_1",
              value: "cus_planted",
            },
          ],
        }),
      ).resolves.toBeNull();
    });

    it("should not let public metadata override the private mapping", async () => {
      // when / then
      await expect(
        getWithPublicMetadata({
          accountId: "acct_1",
          channelSlug: "default-channel",
          publicMetadata: [
            {
              key: "stripe.customer.default-channel.acct_1",
              value: "cus_planted",
            },
          ],
        }),
      ).resolves.toBe("cus_default");
    });
  });
});
