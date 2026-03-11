import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const { getAppConfigMock } = vi.hoisted(() => ({
  getAppConfigMock: vi.fn(),
}));

vi.mock("@/lib/saleor/app-config", () => ({
  getAppConfig: getAppConfigMock,
}));

function createWebhookRequest(payload: unknown): Request {
  return new Request("http://localhost/api/saleor/webhooks/order-created", {
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
      "saleor-domain": "example.saleor.cloud",
      "saleor-event": "ORDER_CREATED",
      "saleor-signature": "signature",
    },
    method: "POST",
  });
}

function createPayload(options: {
  customerId?: string | null;
  includeVendorMetadataOnOrder?: boolean;
}) {
  return {
    order: {
      id: "order-1",
      lines: [
        {
          id: "line-1",
          productName: "Product",
          productSku: "SKU-1",
          variant: {
            id: "variant-1",
            product: {
              id: "product-1",
              metadata: [{ key: "vendor.id", value: "vendor-1" }],
            },
          },
        },
      ],
      metadata: options.includeVendorMetadataOnOrder
        ? [{ key: "vendor.id", value: "vendor-1" }]
        : [],
      number: "1001",
      user:
        options.customerId === null
          ? null
          : { id: options.customerId ?? "cust-1" },
    },
  };
}

describe("order-created webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAppConfigMock.mockResolvedValue({ authToken: "auth-token" });
    global.fetch = vi.fn();
  });

  it("adds new customer id to vendor metadata", async () => {
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: { updateMetadata: { errors: [] } } }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              page: {
                id: "vendor-1",
                metadata: [{ key: "meta.customers", value: '["cust-1"]' }],
              },
            },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: { updateMetadata: { errors: [] } } }),
        ),
      );

    const response = await POST(
      createWebhookRequest(
        createPayload({
          customerId: "cust-2",
          includeVendorMetadataOnOrder: false,
        }),
      ) as never,
    );
    const data = await response.json();

    expect(data.orderMetadataStatus).toBe("updated");
    expect(data.customerSyncStatus).toBe("updated");
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const vendorUpdateBody = JSON.parse(
      fetchMock.mock.calls[2][1].body as string,
    ) as {
      variables: { input: Array<{ key: string; value: string }> };
    };

    expect(vendorUpdateBody.variables.input[0]).toEqual({
      key: "meta.customers",
      value: '["cust-1","cust-2"]',
    });
  });

  it("skips vendor customer sync for guest order", async () => {
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;

    const response = await POST(
      createWebhookRequest(
        createPayload({
          customerId: null,
          includeVendorMetadataOnOrder: true,
        }),
      ) as never,
    );
    const data = await response.json();

    expect(data.customerSyncStatus).toBe("skipped_guest_order");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not update metadata when customer already exists", async () => {
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            page: {
              id: "vendor-1",
              metadata: [{ key: "meta.customers", value: '["cust-1"]' }],
            },
          },
        }),
      ),
    );

    const response = await POST(
      createWebhookRequest(
        createPayload({
          customerId: "cust-1",
          includeVendorMetadataOnOrder: true,
        }),
      ) as never,
    );
    const data = await response.json();

    expect(data.customerSyncStatus).toBe("unchanged");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
