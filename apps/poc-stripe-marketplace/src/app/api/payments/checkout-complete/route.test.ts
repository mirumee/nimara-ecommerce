import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAppConfigMock, checkoutCompleteMock } = vi.hoisted(() => ({
  getAppConfigMock: vi.fn(),
  checkoutCompleteMock: vi.fn(),
}));

vi.mock("@/lib/saleor/app-config", () => ({
  getAppConfig: getAppConfigMock,
}));

vi.mock("@/lib/saleor/client", () => ({
  checkoutComplete: checkoutCompleteMock,
}));

import { POST } from "./route";

describe("payments/checkout-complete route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAppConfigMock.mockResolvedValue({
      authToken: "token",
      saleorAppId: "app-id",
      saleorDomain: "nimara-local-marketplace.eu.saleor.cloud",
      registeredAt: new Date().toISOString(),
    });
  });

  it("returns 400 for invalid body", async () => {
    const request = new Request("http://localhost:3002/api/payments/checkout-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutIds: [] }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 409 when all checkouts fail", async () => {
    checkoutCompleteMock.mockResolvedValue({
      order: null,
      errors: [{ field: "id", message: "not found", code: "NOT_FOUND" }],
    });

    const request = new Request("http://localhost:3002/api/payments/checkout-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutIds: ["chk_1"] }),
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
  });

  it("returns 200 for partial success", async () => {
    checkoutCompleteMock
      .mockResolvedValueOnce({
        order: {
          id: "ord_1",
          number: "1001",
          status: "UNFULFILLED",
          paymentStatus: "NOT_CHARGED",
          total: { gross: { amount: 20, currency: "USD" } },
        },
        errors: [],
      })
      .mockResolvedValueOnce({
        order: null,
        errors: [{ field: "id", message: "not found", code: "NOT_FOUND" }],
      });

    const request = new Request("http://localhost:3002/api/payments/checkout-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutIds: ["chk_1", "chk_2"] }),
    });

    const response = await POST(request);
    const data = (await response.json()) as {
      completedOrders: Array<{ orderId: string; sourceCheckoutId: string }>;
      failedCheckouts: Array<{ checkoutId: string }>;
    };

    expect(response.status).toBe(200);
    expect(data.completedOrders).toHaveLength(1);
    expect(data.completedOrders[0]).toEqual(
      expect.objectContaining({
        orderId: "ord_1",
        sourceCheckoutId: "chk_1",
      }),
    );
    expect(data.failedCheckouts).toHaveLength(1);
  });
});
