import { afterEach, describe, expect, it, vi } from "vitest";

async function loadAllowedDomains(value?: string) {
  vi.resetModules();

  if (value === undefined) {
    vi.stubEnv("ALLOWED_SALEOR_DOMAINS", undefined as unknown as string);
  } else {
    vi.stubEnv("ALLOWED_SALEOR_DOMAINS", value);
  }

  const { APP_CONFIG } = await import("./consts");

  return APP_CONFIG.ALLOWED_DOMAINS;
}

describe("APP_CONFIG.ALLOWED_DOMAINS", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is empty when the variable is unset", async () => {
    expect(await loadAllowedDomains()).toEqual([]);
  });

  it("is empty when the variable is set to an empty value", async () => {
    expect(await loadAllowedDomains("")).toEqual([]);
  });

  it("trims entries and drops blank ones", async () => {
    expect(
      await loadAllowedDomains(" a.saleor.cloud , ,b.saleor.cloud"),
    ).toEqual(["a.saleor.cloud", "b.saleor.cloud"]);
  });
});
