import { beforeEach, describe, expect, it, vi } from "vitest";

import { CONFIG } from "@/config";

import { SaleorDomainNotAllowedError } from "../error";
import { assertDomainAllowed } from "./context";

vi.mock("@/config", () => ({
  CONFIG: { ALLOWED_DOMAINS: [] as string[] },
}));

describe("assertDomainAllowed", () => {
  beforeEach(() => {
    CONFIG.ALLOWED_DOMAINS = [];
  });

  it("passes for an allowed domain", () => {
    // given
    CONFIG.ALLOWED_DOMAINS = ["*.saleor.cloud"];

    // when, then
    expect(() => assertDomainAllowed("store.eu.saleor.cloud")).not.toThrow();
  });

  it("rejects every domain while the allowlist is unset", () => {
    // when, then
    expect(() => assertDomainAllowed("store.eu.saleor.cloud")).toThrow(
      /Set ALLOWED_DOMAINS/,
    );
  });

  it("rejects a domain outside the allowlist", () => {
    // given
    CONFIG.ALLOWED_DOMAINS = ["store.eu.saleor.cloud"];

    // when, then
    expect(() => assertDomainAllowed("evil.example.com")).toThrow(
      SaleorDomainNotAllowedError,
    );
  });
});
