import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("manifest route", () => {
  it("returns absolute URLs and register tokenTargetUrl", async () => {
    const request = new Request("https://app.example.com/api/saleor/manifest");
    const response = await GET(request);
    const data = (await response.json()) as {
      tokenTargetUrl: string;
      appUrl: string;
      webhooks: unknown[];
    };

    expect(response.status).toBe(200);
    expect(data.tokenTargetUrl).toBe("https://app.example.com/api/saleor/register");
    expect(data.appUrl).toBe("https://app.example.com/app");
    expect(data.webhooks).toEqual([]);
  });
});
