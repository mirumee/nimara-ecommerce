import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  prepareServiceConfig,
  prepareSingleTenantServiceConfig,
} from "./service";

const PKG = { name: "@nimara/feed-sync", version: "1.2.3" };
const MODULE_URL = "file:///apps/feed-sync/src/services/handler/config.ts";

const withEnv = <T>(env: Record<string, string>, act: () => T) => {
  const original = { ...process.env };

  Object.assign(process.env, env);

  try {
    return act();
  } finally {
    process.env = original;
  }
};

describe("config service", () => {
  describe("prepareServiceConfig", () => {
    it("names the service after the directory it is parsed from", () => {
      // when
      const config = withEnv({ ENVIRONMENT: "test" }, () =>
        prepareServiceConfig({ moduleUrl: MODULE_URL, pkg: PKG }),
      );

      // then two services name themselves apart without being told.
      expect(config.SERVICE).toBe("handler");
    });

    it("takes a schema the service adds on top", () => {
      // when
      const config = withEnv(
        { ENVIRONMENT: "test", QUEUE_URL: "sqs://q" },
        () =>
          prepareServiceConfig({
            moduleUrl: MODULE_URL,
            pkg: PKG,
            schema: z.object({ QUEUE_URL: z.string() }),
          }),
      );

      // then
      expect(config).toMatchObject({
        QUEUE_URL: "sqs://q",
        SERVICE: "handler",
      });
    });

    it("admits a wildcard, because it may serve many", () => {
      // when / then
      expect(() =>
        withEnv(
          { ENVIRONMENT: "test", ALLOWED_DOMAINS: "*.saleor.cloud" },
          () => prepareServiceConfig({ moduleUrl: MODULE_URL, pkg: PKG }),
        ),
      ).not.toThrow();
    });
  });

  describe("prepareSingleTenantServiceConfig", () => {
    it("publishes the one domain it serves", () => {
      // when
      const config = withEnv(
        { ENVIRONMENT: "test", ALLOWED_DOMAINS: "shop.saleor.cloud" },
        () =>
          prepareSingleTenantServiceConfig({
            moduleUrl: MODULE_URL,
            pkg: PKG,
          }),
      );

      // then work with no request to read a tenant from has one here.
      expect(config.SALEOR_DOMAIN).toBe("shop.saleor.cloud");
    });

    it.each([
      ["a wildcard, which names no host", "*.saleor.cloud"],
      ["two domains", "a.saleor.cloud,b.saleor.cloud"],
      ["none at all", ""],
    ])("refuses %s", (_, allowedDomains) => {
      // when / then
      expect(() =>
        withEnv({ ENVIRONMENT: "test", ALLOWED_DOMAINS: allowedDomains }, () =>
          prepareSingleTenantServiceConfig({
            moduleUrl: MODULE_URL,
            pkg: PKG,
          }),
        ),
      ).toThrow();
    });
  });
});
