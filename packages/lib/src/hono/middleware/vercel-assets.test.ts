import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { createTestApp } from "#root/hono/test/app";

import { vercelAssetsMiddleware } from "./vercel-assets";

const BUNDLE = "console.log(1)";
const BUNDLE_NAME = "handler-entry-client.js";
const ASSETS = { [BUNDLE_NAME]: Buffer.from(BUNDLE).toString("base64") };

const request = ({
  assets = ASSETS,
  basePath,
  method = "GET",
  path,
}: {
  assets?: Record<string, string>;
  basePath?: string;
  method?: string;
  path: string;
}) => {
  const routes = new Hono()
    .use(vercelAssetsMiddleware({ assets, basePath }))
    .get("/assets/handled-elsewhere.js", (context) => context.text("routed"));

  return createTestApp({ app: routes }).request(path, { method });
};

describe("vercel-assets", () => {
  it("serves a baked-in asset with the content type of its extension", async () => {
    // when
    const response = await request({ path: `/assets/${BUNDLE_NAME}` });

    // then
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/javascript; charset=utf-8",
    );
    expect(await response.text()).toBe(BUNDLE);
  });

  it("serves the same asset under a base path", async () => {
    // when
    const response = await request({
      basePath: "/stripe",
      path: `/stripe/assets/${BUNDLE_NAME}`,
    });

    // then
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(BUNDLE);
  });

  it("declines a name the build never emitted", async () => {
    // when
    const response = await request({ path: "/assets/..%2f..%2fpackage.json" });

    // then
    expect(response.status).toBe(404);
  });

  it("declines every request when the build baked in no assets", async () => {
    // when
    const response = await request({
      assets: {},
      path: `/assets/${BUNDLE_NAME}`,
    });

    // then
    expect(response.status).toBe(404);
  });

  it("leaves a route of its own under the prefix reachable", async () => {
    // when
    const response = await request({ path: "/assets/handled-elsewhere.js" });

    // then
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("routed");
  });

  it("ignores a method other than GET", async () => {
    // when
    const response = await request({
      method: "POST",
      path: `/assets/${BUNDLE_NAME}`,
    });

    // then
    expect(response.status).toBe(404);
  });
});
