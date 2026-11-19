import { NextRequest } from "next/server";
import { afterEach, expect, it, vi } from "vitest";

import { GET } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
});

it("mounts Marketplace in the Saleor Dashboard at the app URL", async () => {
  vi.stubEnv("NEXT_PUBLIC_MARKETPLACE_VENDOR_URL", "https://vendor.example");

  const response = await GET(
    new NextRequest("https://vendor.example/api/saleor/manifest"),
  );
  const manifest = await response.json();

  expect(manifest.appUrl).toBe("https://vendor.example/app");
  expect(manifest.extensions).toStrictEqual([
    {
      label: "Marketplace",
      mount: "NAVIGATION_CATALOG",
      permissions: ["MANAGE_USERS"],
      target: "APP_PAGE",
      url: "/",
    },
  ]);
});
