import { beforeEach, describe, expect, it, vi } from "vitest";

import { METADATA_KEYS } from "@/lib/saleor/consts";

import { POST } from "./route";

const {
  getVendorPageMetadataMock,
  isStripeConnectOnboardingCompletedMock,
  updateVendorPageMetadataMock,
  verifyStripeWebhookSignatureMock,
} = vi.hoisted(() => ({
  verifyStripeWebhookSignatureMock: vi.fn(),
  isStripeConnectOnboardingCompletedMock: vi.fn(),
  getVendorPageMetadataMock: vi.fn(),
  updateVendorPageMetadataMock: vi.fn(),
}));

vi.mock("@/lib/stripe/connect", () => ({
  verifyStripeWebhookSignature: verifyStripeWebhookSignatureMock,
  isStripeConnectOnboardingCompleted: isStripeConnectOnboardingCompletedMock,
}));

vi.mock("@/lib/saleor/vendor-page-metadata", () => ({
  getVendorPageMetadata: getVendorPageMetadataMock,
  updateVendorPageMetadata: updateVendorPageMetadataMock,
}));

function createRequest(
  payload: unknown,
  signature = "test-signature",
): Request {
  return new Request("http://localhost/api/stripe/connect/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(signature ? { "stripe-signature": signature } : {}),
    },
    body: JSON.stringify(payload),
  });
}

describe("stripe connect webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyStripeWebhookSignatureMock.mockReturnValue(true);
    isStripeConnectOnboardingCompletedMock.mockReturnValue(true);
    getVendorPageMetadataMock.mockResolvedValue([
      { key: "existing", value: "1" },
    ]);
    updateVendorPageMetadataMock.mockResolvedValue(undefined);
    process.env.NEXT_PUBLIC_SALEOR_URL =
      "https://example.saleor.cloud/graphql/";
  });

  it("updates vendor metadata for account.updated", async () => {
    const response = await POST(
      createRequest({
        id: "evt_1",
        type: "account.updated",
        data: {
          object: {
            id: "acct_123",
            details_submitted: true,
            requirements: { currently_due: [] },
            metadata: {
              vendor_id: "vendor-page-1",
              saleor_domain: "example.saleor.cloud",
            },
          },
        },
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("processed");
    expect(getVendorPageMetadataMock).toHaveBeenCalledWith({
      saleorDomain: "example.saleor.cloud",
      vendorPageId: "vendor-page-1",
    });
    expect(updateVendorPageMetadataMock).toHaveBeenCalledTimes(1);

    const call = updateVendorPageMetadataMock.mock.calls[0]?.[0] as {
      metadata: Array<{ key: string; value: string }>;
    };
    const map = new Map(call.metadata.map((item) => [item.key, item.value]));

    expect(map.get(METADATA_KEYS.PAYMENT_ACCOUNT_ID)).toBe("acct_123");
    expect(map.get(METADATA_KEYS.PAYMENT_ACCOUNT_CONNECTED)).toBe("true");
  });

  it("returns 400 for invalid signature", async () => {
    verifyStripeWebhookSignatureMock.mockReturnValue(false);

    const response = await POST(
      createRequest({
        type: "account.updated",
      }),
    );

    expect(response.status).toBe(400);
    expect(updateVendorPageMetadataMock).not.toHaveBeenCalled();
  });

  it("skips event without vendor_id metadata", async () => {
    const response = await POST(
      createRequest({
        id: "evt_2",
        type: "account.updated",
        data: {
          object: {
            id: "acct_123",
            metadata: {},
          },
        },
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("skipped");
    expect(data.reason).toBe("missing_vendor_id");
    expect(updateVendorPageMetadataMock).not.toHaveBeenCalled();
  });

  it("returns 400 when stripe-signature is missing", async () => {
    const response = await POST(createRequest({ type: "account.updated" }, ""));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Missing stripe-signature");
    expect(verifyStripeWebhookSignatureMock).not.toHaveBeenCalled();
  });
});
