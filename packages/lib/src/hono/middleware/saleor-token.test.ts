import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { err, ok } from "@nimara/domain/objects/Result";
import { type JoseAuthService } from "@nimara/infrastructure/jose/auth/types";

import { requireSaleorTenant } from "#root/hono/saleor/tenant";
import { createTestApp } from "#root/hono/test/app";

import { saleorTokenMiddleware } from "./saleor-token";

const ATTACKER = {
  apiUrl: "https://attacker.example.com/graphql/",
  domain: "attacker.example.com",
  token: "attacker-token",
};

const VICTIM = {
  apiUrl: "https://victim.example.com/graphql/",
  domain: "victim.example.com",
};

const ALLOWED_DOMAINS = [ATTACKER.domain, VICTIM.domain];

/**
 * One key pair per Saleor: a token only verifies against the issuer that
 * signed it. Keyed by domain, the way the real JWKS lookup is.
 */
const signedBy = vi.hoisted(() => new Map<string, string>());

const joseAuthService = vi.fn(
  (saleorDomain: string): JoseAuthService =>
    ({
      verifyJwt: vi.fn(async (jwt: string) =>
        signedBy.get(jwt) === saleorDomain
          ? ok({ permissions: ["MANAGE_APPS"] })
          : err([
              {
                code: "JWT_VERIFICATION_ERROR" as const,
                message: "Failed to verify the signature.",
              },
            ]),
      ),
    }) as unknown as JoseAuthService,
);

const buildApp = ({
  requiredPermissions = ["MANAGE_APPS"],
}: { requiredPermissions?: string[] } = {}) => {
  const routes = new Hono()
    .use(
      saleorTokenMiddleware({
        allowedDomains: ALLOWED_DOMAINS,
        joseAuthService,
        requiredPermissions,
      }),
    )
    // Echoes what the app would scope its reads and writes by.
    .post("/config/save", (context) =>
      context.json(requireSaleorTenant(context)),
    );

  return createTestApp({ app: routes });
};

const request = ({
  apiUrl,
  body = {},
  headers = {},
  requiredPermissions,
  token,
}: {
  apiUrl?: string;
  body?: unknown;
  headers?: Record<string, string>;
  requiredPermissions?: string[];
  token?: string;
}) =>
  buildApp({ requiredPermissions }).request("/config/save", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(apiUrl ? { "saleor-api-url": apiUrl } : {}),
      ...headers,
    },
    body: JSON.stringify(body),
  });

describe("saleor-token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signedBy.clear();
    signedBy.set(ATTACKER.token, ATTACKER.domain);
  });

  describe("saleorTokenMiddleware", () => {
    it("scopes the request to the Saleor that signed the token", async () => {
      // when
      const response = await request({
        apiUrl: ATTACKER.apiUrl,
        token: ATTACKER.token,
      });

      // then
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        saleorApiUrl: ATTACKER.apiUrl,
        saleorDomain: ATTACKER.domain,
      });
    });

    it("ignores a tenant named in the body", async () => {
      // given a caller holding a token their own Saleor signed, naming another
      // installation in the payload — the shape that let a verified caller
      // read and overwrite a Saleor they never proved they belong to.

      // when
      const response = await request({
        apiUrl: ATTACKER.apiUrl,
        body: { saleorDomain: VICTIM.domain, saleorApiUrl: VICTIM.apiUrl },
        token: ATTACKER.token,
      });

      // then
      expect(await response.json()).toEqual({
        saleorApiUrl: ATTACKER.apiUrl,
        saleorDomain: ATTACKER.domain,
      });
    });

    it("refuses a token that another Saleor signed", async () => {
      // given the same caller claiming the victim's installation outright

      // when
      const response = await request({
        apiUrl: VICTIM.apiUrl,
        token: ATTACKER.token,
      });

      // then
      expect(response.status).toBe(401);
      expect(joseAuthService).toHaveBeenCalledWith(VICTIM.domain);
    });

    it("refuses a verified token lacking a required permission", async () => {
      // given a token this Saleor did sign — a storefront customer's, say

      // when
      const response = await request({
        apiUrl: ATTACKER.apiUrl,
        requiredPermissions: ["MANAGE_APPS", "HANDLE_PAYMENTS"],
        token: ATTACKER.token,
      });

      // then
      expect(response.status).toBe(403);
      expect((await response.json()).description).toContain("HANDLE_PAYMENTS");
    });

    it("admits a permission the token's user_permissions grants, not just permissions", async () => {
      // given a token scoped down to the app's own manifest, from a staff
      // member whose account still holds the required permission
      joseAuthService.mockImplementationOnce(
        () =>
          ({
            verifyJwt: vi.fn(async () =>
              ok({
                permissions: ["MANAGE_PRODUCTS"],
                user_permissions: ["MANAGE_APPS"],
              }),
            ),
          }) as unknown as JoseAuthService,
      );

      // when
      const response = await request({
        apiUrl: ATTACKER.apiUrl,
        requiredPermissions: ["MANAGE_APPS"],
        token: ATTACKER.token,
      });

      // then
      expect(response.status).toBe(200);
    });

    it("refuses a Saleor outside the allow list before verifying anything", async () => {
      // given a Saleor the attacker controls, serving its own JWKS
      signedBy.set("stranger-token", "stranger.example.com");

      // when
      const response = await request({
        apiUrl: "https://stranger.example.com/graphql/",
        token: "stranger-token",
      });

      // then
      expect(response.status).toBe(401);
      expect(joseAuthService).not.toHaveBeenCalled();
    });

    it.each([
      { name: "the bearer token", apiUrl: ATTACKER.apiUrl },
      { name: "the API URL", token: ATTACKER.token },
      {
        name: "a usable API URL",
        headers: { "saleor-api-url": "not-a-url" },
        token: ATTACKER.token,
      },
    ])("refuses a request missing $name", async ({ name: _name, ...rest }) => {
      // when
      const response = await request(rest);

      // then
      expect(response.status).toBe(401);
    });
  });
});
