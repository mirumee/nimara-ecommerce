import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAppConfigMock, checkoutCompleteMock, orderCancelMock } = vi.hoisted(() => ({
  getAppConfigMock: vi.fn(),
  checkoutCompleteMock: vi.fn(),
  orderCancelMock: vi.fn(),
}));

vi.mock("@/lib/saleor/app-config", () => ({
  getAppConfig: getAppConfigMock,
}));

vi.mock("@/lib/saleor/client", () => ({
  checkoutComplete: checkoutCompleteMock,
  orderCancel: orderCancelMock,
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
    expect(orderCancelMock).not.toHaveBeenCalled();
  });

  it("returns 409 for partial success and performs rollback", async () => {
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
    orderCancelMock.mockResolvedValue({
      order: {
        id: "ord_1",
      },
      errors: [],
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
      rollbackFailures: Array<{ orderId: string }>;
      rolledBackOrders: Array<{ orderId: string; sourceCheckoutId: string }>;
    };

    expect(response.status).toBe(409);
    expect(data.completedOrders).toHaveLength(1);
    expect(data.completedOrders[0]).toEqual(
      expect.objectContaining({
        orderId: "ord_1",
        sourceCheckoutId: "chk_1",
      }),
    );
    expect(data.failedCheckouts).toHaveLength(1);
    expect(data.rolledBackOrders).toEqual([
      {
        orderId: "ord_1",
        sourceCheckoutId: "chk_1",
      },
    ]);
    expect(data.rollbackFailures).toEqual([]);
    expect(orderCancelMock).toHaveBeenCalledTimes(1);
    expect(orderCancelMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "ord_1",
      }),
    );
  });

  it("returns 200 for full success", async () => {
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
        order: {
          id: "ord_2",
          number: "1002",
          status: "UNFULFILLED",
          paymentStatus: "NOT_CHARGED",
          total: { gross: { amount: 10, currency: "USD" } },
        },
        errors: [],
      });

    const request = new Request("http://localhost:3002/api/payments/checkout-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutIds: ["chk_1", "chk_2"] }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(orderCancelMock).not.toHaveBeenCalled();
  });
});
