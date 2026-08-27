import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createService, listApps } from "./create-service";

let root: string;

const MULTI =
  'import { prepareServiceConfig } from "@nimara/lib/config/service";\n';
const SINGLE =
  'import { prepareSingleTenantServiceConfig } from "@nimara/lib/config/service";\n';

const write = async (path: string, contents: string) => {
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, contents);
};

const templateService = (...parts: string[]) =>
  join(root, "templates", "app", "src", "services", "handler", ...parts);

const appService = (service: string, ...parts: string[]) =>
  join(root, "apps", "feed-sync", "src", "services", service, ...parts);

const add = (name = "order-sync") =>
  createService({ app: "feed-sync", name, root });

describe("create-service", () => {
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "nimara-gen-"));

    await write(templateService("config.ts"), MULTI);
    await write(
      templateService("entry-server.ts"),
      'import { container } from "@/container";\nexport const app = 1;\n',
    );
    await write(
      templateService("api", "rest", "saleor", "index.test.ts"),
      'import { app } from "@/services/handler/entry-server";\n',
    );

    await write(join(root, "apps", "feed-sync", "etc", "build.ts"), "build");
    await write(appService("handler", "config.ts"), MULTI);
  });

  afterEach(() => rm(root, { force: true, recursive: true }));

  it("copies the template's service under the name it was given", async () => {
    // when
    const serviceDir = await add();

    // then
    expect(serviceDir).toBe(appService("order-sync"));
    expect(await readFile(appService("order-sync", "config.ts"), "utf8")).toBe(
      MULTI,
    );
  });

  it("points the copied imports at the new service", async () => {
    // when
    await add();
    const test = await readFile(
      appService("order-sync", "api", "rest", "saleor", "index.test.ts"),
      "utf8",
    );

    // then the copy would otherwise run the template's entry point, not its own.
    expect(test).toContain('"@/services/order-sync/entry-server"');
    expect(test).not.toContain("@/services/handler/");
  });

  it("leaves imports that name no service alone", async () => {
    // when
    await add();

    // then
    expect(
      await readFile(appService("order-sync", "entry-server.ts"), "utf8"),
    ).toContain('"@/container"');
  });

  it("normalises a name that is not already a directory name", async () => {
    // when
    const serviceDir = await add("  Order Sync!  ");

    // then `--args` skips the prompt that would have filtered it.
    expect(serviceDir).toBe(appService("order-sync"));
  });

  it("refuses to write over a service that already exists", async () => {
    // given
    await add();

    // when / then
    await expect(add()).rejects.toThrow();
  });

  it("inherits single tenancy from the services already there", async () => {
    // given an app generated as single-tenant
    await write(appService("handler", "config.ts"), SINGLE);

    // when
    await add();

    // then the services share one `.env`, so a new one must read it the same way.
    expect(await readFile(appService("order-sync", "config.ts"), "utf8")).toBe(
      SINGLE,
    );
  });

  it("leaves a multi-tenant app on the shared helper", async () => {
    // when
    await add();

    // then
    expect(
      await readFile(appService("order-sync", "config.ts"), "utf8"),
    ).not.toContain("prepareSingleTenantServiceConfig");
  });

  describe("listApps", () => {
    it("offers only the apps built from src/services", async () => {
      // given a Next.js app beside the Saleor one
      await write(join(root, "apps", "storefront", "package.json"), "{}");

      // when / then `etc/build.ts` is what the Saleor apps have and Next has not.
      expect(listApps(root)).toEqual(["feed-sync"]);
    });

    it("returns nothing when there are no apps yet", () => {
      // when / then
      expect(listApps(join(root, "elsewhere"))).toEqual([]);
    });
  });
});
