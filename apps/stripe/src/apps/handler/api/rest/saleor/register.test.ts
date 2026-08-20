import { beforeEach, describe, expect, it, vi } from "vitest";

import { ok } from "@nimara/domain/objects/Result";

import { createTestApp } from "@/lib/test/app";

const mocks = vi.hoisted(() => ({
  allowedDomains: [] as string[],
  installApp: vi.fn(),
}));

vi.mock("@/container", () => ({
  container: {
    get: vi.fn((key: string) => {
      switch (key) {
        case "config":
          return {
            ALLOWED_DOMAINS: mocks.allowedDomains,
            APP_ID: "TEST.stripe",
            BASE_PATH: "",
            ENVIRONMENT: "TEST",
            VERSION: "1.0.0",
          };
        case "installApp":
          return mocks.installApp;
        case "joseAuthService":
          return vi.fn();
        case "appConfigService":
          return { getBySaleorDomain: vi.fn() };
        default:
          throw new Error(`Unexpected container key: ${key}`);
      }
    }),
  },
}));

const { saleorRoutes } = await import("./index");

const register = (saleorDomain: string) =>
  createTestApp({ app: saleorRoutes }).request("/register", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "saleor-api-url": `https://${saleorDomain}/graphql/`,
      "saleor-domain": saleorDomain,
    },
    body: JSON.stringify({ auth_token: "token" }),
  });

describe("register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.allowedDomains = [];
    mocks.installApp.mockResolvedValue(ok({}));
  });

  it("should refuse every domain when the allowlist is unconfigured", async () => {
    // when
    const response = await register("saleor.example.com");

    // then
    expect(response.status).toBe(401);
    expect(mocks.installApp).not.toHaveBeenCalled();
  });

  it("should name ALLOWED_DOMAINS when the allowlist is unconfigured", async () => {
    // when
    const response = await register("saleor.example.com");
    const body = await response.text();

    // then
    expect(body).toContain("ALLOWED_DOMAINS");
  });

  it("should not name the setting when the domain is merely absent from a configured allowlist", async () => {
    // given
    mocks.allowedDomains = ["other.example.com"];

    // when
    const response = await register("saleor.example.com");
    const body = await response.text();

    // then
    expect(response.status).toBe(401);
    expect(body).toContain("saleor.example.com");
    expect(body).not.toContain("ALLOWED_DOMAINS");
  });

  it("should install for a domain the allowlist admits", async () => {
    // given
    mocks.allowedDomains = ["saleor.example.com"];

    // when
    const response = await register("saleor.example.com");

    // then
    expect(response.status).toBe(200);
    expect(mocks.installApp).toHaveBeenCalledOnce();
  });
});
