import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchSaleorAppIdMock, setAppConfigMock } = vi.hoisted(() => ({
  fetchSaleorAppIdMock: vi.fn(),
  setAppConfigMock: vi.fn(),
}));

vi.mock("@/lib/saleor/client", () => ({
  fetchSaleorAppId: fetchSaleorAppIdMock,
}));

vi.mock("@/lib/saleor/app-config", () => ({
  setAppConfig: setAppConfigMock,
}));

import { POST } from "./route";

describe("register route", () => {
  beforeEach(() => {
    fetchSaleorAppIdMock.mockReset();
    setAppConfigMock.mockReset();
  });

  it("returns 400 for invalid headers", async () => {
    const request = new Request("http://localhost:3002/api/saleor/register", {
      method: "POST",
      body: JSON.stringify({ auth_token: "token" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 403 for non-matching domain", async () => {
    const request = new Request("http://localhost:3002/api/saleor/register", {
      method: "POST",
      body: JSON.stringify({ auth_token: "token" }),
      headers: {
        "Content-Type": "application/json",
        "saleor-domain": "other.saleor.cloud",
        "saleor-api-url": "https://other.saleor.cloud/graphql/",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it("returns ok and saves config on success", async () => {
    fetchSaleorAppIdMock.mockResolvedValue("app-id-1");

    const request = new Request("http://localhost:3002/api/saleor/register", {
      method: "POST",
      body: JSON.stringify({ auth_token: "token" }),
      headers: {
        "Content-Type": "application/json",
        "saleor-domain": "localhost:8000",
        "saleor-api-url": "http://localhost:8000/graphql/",
      },
    });

    const response = await POST(request);
    const data = (await response.json()) as { status: string };

    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(fetchSaleorAppIdMock).toHaveBeenCalledWith({
      authToken: "token",
      saleorApiUrl: "http://localhost:8000/graphql/",
    });
    expect(setAppConfigMock).toHaveBeenCalledTimes(1);
  });
});
