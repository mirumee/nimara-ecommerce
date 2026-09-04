import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Hono } from "hono";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createTestApp } from "#root/hono/test/app";

import { nodeAssetsMiddleware } from "./node-assets";

const BUNDLE = "console.log(1)";
const BUNDLE_NAME = "handler-entry-client.js";

let assetsDir: string;

beforeAll(async () => {
  assetsDir = await mkdtemp(join(tmpdir(), "nimara-assets-"));

  await writeFile(join(assetsDir, BUNDLE_NAME), BUNDLE);
});

afterAll(() => rm(assetsDir, { force: true, recursive: true }));

const request = ({
  basePath,
  dir,
  method = "GET",
  path,
}: {
  basePath?: string;
  dir?: string;
  method?: string;
  path: string;
}) => {
  const routes = new Hono()
    .use(nodeAssetsMiddleware({ basePath, dir: dir ?? assetsDir }))
    .get("/assets/handled-elsewhere.js", (context) => context.text("routed"));

  return createTestApp({ app: routes }).request(path, { method });
};

describe("node-assets", () => {
  it("serves a built asset with the content type of its extension", async () => {
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

  it("keeps a traversing name inside the assets directory", async () => {
    // when
    const response = await request({ path: "/assets/..%2f..%2fpackage.json" });

    // then
    expect(response.status).toBe(404);
  });

  it("declines every request when the directory holds no assets", async () => {
    // when
    const response = await request({
      dir: join(assetsDir, "absent"),
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
