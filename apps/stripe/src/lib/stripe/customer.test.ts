import { type Stripe } from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CONFIG } from "@/config";
import { type SaleorClient } from "@/lib/saleor/client";

import {
  findGatewayCustomerId,
  resolveGatewayCustomerId,
  type SaleorWebhookUser,
} from "./customer";

const CHANNEL_SLUG = "default-channel";
const SALEOR_DOMAIN = "shop.saleor.cloud";
const ENVIRONMENT = "production";
const ACCOUNT_ID = "acct_123";
const METADATA_KEY = `stripe.customer.${CHANNEL_SLUG}.${ACCOUNT_ID}`;
const USER_ID = "VXNlcjox";

const buildUser = ({
  privateMetadata = [],
}: Partial<Pick<SaleorWebhookUser, "privateMetadata">> = {}) =>
  ({
    email: "shopper@example.com",
    firstName: "Ada",
    id: USER_ID,
    lastName: "Lovelace",
    privateMetadata,
  }) satisfies SaleorWebhookUser;

const buildLogger = () => ({
  critical: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
});

const buildSaleorClient = (
  errors: { message: string }[] = [],
): SaleorClient & { execute: ReturnType<typeof vi.fn> } =>
  ({
    execute: vi.fn().mockResolvedValue({
      updatePrivateMetadata: { errors },
    }),
  }) as unknown as SaleorClient & { execute: ReturnType<typeof vi.fn> };

type StripeMock = Stripe & {
  customers: {
    create: ReturnType<typeof vi.fn>;
  };
};

const buildStripe = ({
  createdId = "cus_created",
}: { createdId?: string } = {}) =>
  ({
    customers: {
      create: vi.fn().mockResolvedValue({ id: createdId }),
    },
  }) as unknown as StripeMock;

describe("customer", () => {
  beforeEach(() => {
    vi.spyOn(CONFIG, "ENVIRONMENT", "get").mockReturnValue(ENVIRONMENT);
    vi.spyOn(CONFIG, "APP_ID", "get").mockReturnValue("app_123");
  });

  describe("findGatewayCustomerId", () => {
    const find = (user: SaleorWebhookUser) =>
      findGatewayCustomerId({
        accountId: ACCOUNT_ID,
        channelSlug: CHANNEL_SLUG,
        user,
      });

    it("should return the customer the app owns", () => {
      // given
      const user = buildUser({
        privateMetadata: [{ key: METADATA_KEY, value: "cus_owned" }],
      });

      // when
      const result = find(user);

      // then
      expect(result).toBe("cus_owned");
    });

    it("should ignore a mapping made for another channel", () => {
      // given
      const user = buildUser({
        privateMetadata: [
          { key: "stripe.customer.other-channel", value: "cus_other" },
        ],
      });

      // when
      const result = find(user);

      // then
      expect(result).toBeNull();
    });

    it("should ignore a mapping made for another Stripe account", () => {
      // given
      const user = buildUser({
        privateMetadata: [
          {
            key: `stripe.customer.${CHANNEL_SLUG}.acct_previous`,
            value: "cus_previous",
          },
        ],
      });

      // when
      const result = find(user);

      // then
      expect(result).toBeNull();
    });

    /**
     * Saleor lets a customer write their own public metadata, so anything
     * kept there is attacker controlled and must never resolve a customer.
     */
    it("should ignore a mapping planted in public metadata", () => {
      // given
      const user = {
        ...buildUser(),
        metadata: [{ key: METADATA_KEY, value: "cus_victim" }],
      } as SaleorWebhookUser;

      // when
      const result = find(user);

      // then
      expect(result).toBeNull();
    });

    it("should return null when the user has no mapping", () => {
      // when
      const result = find(buildUser());

      // then
      expect(result).toBeNull();
    });
  });

  describe("resolveGatewayCustomerId", () => {
    const resolve = (
      user: SaleorWebhookUser,
      stripe: StripeMock,
      saleorClient: ReturnType<typeof buildSaleorClient>,
    ) =>
      resolveGatewayCustomerId({
        accountId: ACCOUNT_ID,
        channelSlug: CHANNEL_SLUG,
        logger: buildLogger(),
        saleorClient,
        saleorDomain: SALEOR_DOMAIN,
        stripe,
        user,
      });

    it("should reuse the owned customer without touching Stripe", async () => {
      // given
      const stripe = buildStripe();
      const saleorClient = buildSaleorClient();
      const user = buildUser({
        privateMetadata: [{ key: METADATA_KEY, value: "cus_owned" }],
      });

      // when
      const result = await resolve(user, stripe, saleorClient);

      // then
      expect(result).toBe("cus_owned");
      expect(stripe.customers.create).not.toHaveBeenCalled();
      expect(saleorClient.execute).not.toHaveBeenCalled();
    });

    /**
     * A customer created in a different Stripe account no longer exists for
     * the key in use, so reusing its id would fail every payment.
     */
    it("should create a customer when the mapping belongs to another account", async () => {
      // given
      const stripe = buildStripe();
      const saleorClient = buildSaleorClient();
      const user = buildUser({
        privateMetadata: [
          {
            key: `stripe.customer.${CHANNEL_SLUG}.acct_previous`,
            value: "cus_previous",
          },
        ],
      });

      // when
      const result = await resolve(user, stripe, saleorClient);

      // then
      expect(result).toBe("cus_created");
      expect(saleorClient.execute).toHaveBeenCalledWith(expect.anything(), {
        variables: {
          id: USER_ID,
          input: [{ key: METADATA_KEY, value: "cus_created" }],
        },
      });
    });

    /**
     * A mapping a shopper planted in their own public metadata must not steer
     * the app to somebody else's customer; they get their own instead.
     */
    it("should never resolve a customer claimed in public metadata", async () => {
      // given
      const stripe = buildStripe();
      const saleorClient = buildSaleorClient();
      const user = {
        ...buildUser(),
        metadata: [{ key: METADATA_KEY, value: "cus_victim" }],
      } as SaleorWebhookUser;

      // when
      const result = await resolve(user, stripe, saleorClient);

      // then
      expect(result).toBe("cus_created");
      expect(saleorClient.execute).toHaveBeenCalledWith(expect.anything(), {
        variables: {
          id: USER_ID,
          input: [{ key: METADATA_KEY, value: "cus_created" }],
        },
      });
    });

    it("should create a customer keyed on the user so concurrent calls collapse", async () => {
      // given
      const stripe = buildStripe();
      const saleorClient = buildSaleorClient();

      // when
      const result = await resolve(buildUser(), stripe, saleorClient);

      // then
      expect(result).toBe("cus_created");

      const [params, options] = stripe.customers.create.mock.calls[0];

      expect(params.metadata).toMatchObject({
        channelSlug: CHANNEL_SLUG,
        environment: ENVIRONMENT,
        saleorDomain: SALEOR_DOMAIN,
        saleorUserId: USER_ID,
      });
      expect(params.metadata).not.toHaveProperty("SALEOR_ID");
      expect(options.idempotencyKey).toBe(
        `customer:app_123:${SALEOR_DOMAIN}:${CHANNEL_SLUG}:${USER_ID}`,
      );
      expect(saleorClient.execute).toHaveBeenCalledWith(expect.anything(), {
        variables: {
          id: USER_ID,
          input: [{ key: METADATA_KEY, value: "cus_created" }],
        },
      });
    });

    it("should still return the customer when persisting the mapping fails", async () => {
      // given
      const stripe = buildStripe();
      const saleorClient = buildSaleorClient([{ message: "No permission." }]);

      // when
      const result = await resolve(buildUser(), stripe, saleorClient);

      // then
      expect(result).toBe("cus_created");
    });
  });
});
