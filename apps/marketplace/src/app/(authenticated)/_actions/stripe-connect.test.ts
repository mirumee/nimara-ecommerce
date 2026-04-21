import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createStripeConnectLoginSession,
  createStripeConnectOnboardingSession,
} from "./stripe-connect";

const {
  configurationServiceMock,
  createStripeConnectAccountMock,
  createStripeConnectLoginLinkMock,
  createStripeConnectOnboardingLinkMock,
  getServerAuthTokenMock,
  getServerVendorIdMock,
  getVendorPageMetadataMock,
  resolveSaleorDomainFromTokenMock,
  updateVendorPageMetadataMock,
} = vi.hoisted(() => ({
  getServerAuthTokenMock: vi.fn(),
  getServerVendorIdMock: vi.fn(),
  resolveSaleorDomainFromTokenMock: vi.fn(),
  getVendorPageMetadataMock: vi.fn(),
  updateVendorPageMetadataMock: vi.fn(),
  createStripeConnectAccountMock: vi.fn(),
  createStripeConnectOnboardingLinkMock: vi.fn(),
  createStripeConnectLoginLinkMock: vi.fn(),
  configurationServiceMock: {
    getMe: vi.fn(),
  },
}));

vi.mock("@/lib/auth/server", () => ({
  getServerAuthToken: getServerAuthTokenMock,
  getServerVendorId: getServerVendorIdMock,
}));

vi.mock("@/lib/saleor/vendor-page-metadata", () => ({
  resolveSaleorDomainFromToken: resolveSaleorDomainFromTokenMock,
  getVendorPageMetadata: getVendorPageMetadataMock,
  updateVendorPageMetadata: updateVendorPageMetadataMock,
}));

vi.mock("@/lib/stripe/connect", () => ({
  createStripeConnectAccount: createStripeConnectAccountMock,
  createStripeConnectOnboardingLink: createStripeConnectOnboardingLinkMock,
  createStripeConnectLoginLink: createStripeConnectLoginLinkMock,
  getStripeConnectAccount: vi.fn(),
  isStripeConnectOnboardingCompleted: vi.fn(),
}));

vi.mock("@/services/configuration", () => ({
  configurationService: configurationServiceMock,
}));

describe("stripe connect actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerAuthTokenMock.mockResolvedValue("jwt-token");
    getServerVendorIdMock.mockResolvedValue("vendor-page-1");
    resolveSaleorDomainFromTokenMock.mockReturnValue("example.saleor.cloud");
    updateVendorPageMetadataMock.mockResolvedValue(undefined);
    configurationServiceMock.getMe.mockResolvedValue({
      ok: true,
      data: { me: { email: "vendor@example.com" } },
    });
  });

  it("creates Stripe account and onboarding link when account id is missing", async () => {
    getVendorPageMetadataMock.mockResolvedValue([]);
    createStripeConnectAccountMock.mockResolvedValue({ id: "acct_123" });
    createStripeConnectOnboardingLinkMock.mockResolvedValue({
      url: "https://connect.stripe.com/onboarding-link",
    });

    const result = await createStripeConnectOnboardingSession();

    expect(result.ok).toBe(true);
    expect(createStripeConnectAccountMock).toHaveBeenCalledWith({
      email: "vendor@example.com",
      saleorDomain: "example.saleor.cloud",
      vendorId: "vendor-page-1",
    });
    expect(updateVendorPageMetadataMock).toHaveBeenCalledTimes(1);
    expect(createStripeConnectOnboardingLinkMock).toHaveBeenCalledWith({
      accountId: "acct_123",
      refreshUrl: expect.stringContaining("/dashboard?stripe=refresh"),
      returnUrl: expect.stringContaining("/dashboard?stripe=return"),
    });
  });

  it("reuses existing Stripe account id and only creates account link", async () => {
    getVendorPageMetadataMock.mockResolvedValue([
      { key: "payment_account_id", value: "acct_existing" },
      { key: "payment_account_connected", value: "false" },
    ]);
    createStripeConnectOnboardingLinkMock.mockResolvedValue({
      url: "https://connect.stripe.com/onboarding-link",
    });

    const result = await createStripeConnectOnboardingSession();

    expect(result.ok).toBe(true);
    expect(createStripeConnectAccountMock).not.toHaveBeenCalled();
    expect(updateVendorPageMetadataMock).not.toHaveBeenCalled();
    expect(createStripeConnectOnboardingLinkMock).toHaveBeenCalledWith({
      accountId: "acct_existing",
      refreshUrl: expect.stringContaining("/dashboard?stripe=refresh"),
      returnUrl: expect.stringContaining("/dashboard?stripe=return"),
    });
  });

  it("creates Stripe login link for configured vendor", async () => {
    getVendorPageMetadataMock.mockResolvedValue([
      { key: "payment_account_id", value: "acct_existing" },
      { key: "payment_account_connected", value: "true" },
    ]);
    createStripeConnectLoginLinkMock.mockResolvedValue({
      url: "https://connect.stripe.com/express/acct_existing",
    });

    const result = await createStripeConnectLoginSession();

    expect(result).toEqual({
      ok: true,
      url: "https://connect.stripe.com/express/acct_existing",
    });
    expect(createStripeConnectLoginLinkMock).toHaveBeenCalledWith({
      accountId: "acct_existing",
    });
  });
});
