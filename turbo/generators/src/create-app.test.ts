import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "./create-app";

let root: string;

const TEMPLATE_PKG = {
  name: "@nimara/app-template",
  private: true,
  scripts: { dev: "vite --port ${PORT:-8000}" },
};

const template = () => join(root, "templates", "app");

const write = async (path: string, contents: string) => {
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, contents);
};

const generate = (target: "node" | "vercel" = "vercel") =>
  createApp({
    description: "Keeps a feed in step with Saleor",
    name: "feed-sync",
    port: "8010",
    root,
    target,
  });

describe("create-app", () => {
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "nimara-gen-"));

    await mkdir(template(), { recursive: true });
    await write(
      join(template(), "package.json"),
      JSON.stringify(TEMPLATE_PKG, null, 2),
    );
    await write(join(template(), "README.md"), "# app-template\nPort 8000.\n");
    await write(
      join(template(), ".env.example"),
      "BUILD_TARGET=vercel\nPORT=8000\n",
    );
    await write(join(template(), "vercel.json"), '{"framework":"hono"}');
    await write(join(template(), "src", "index.ts"), "export const a = 1;\n");
  });

  afterEach(() => rm(root, { force: true, recursive: true }));

  it("names the package after the app, not the template", async () => {
    // when
    const destination = await generate();
    const pkg = JSON.parse(
      await readFile(join(destination, "package.json"), "utf8"),
    );

    // then
    expect(pkg).toMatchObject({
      description: "Keeps a feed in step with Saleor",
      name: "feed-sync",
      scripts: { dev: "vite --port ${PORT:-8010}" },
    });
  });

  it("drops `private`, which only the template needs", async () => {
    // when
    const destination = await generate();
    const pkg = JSON.parse(
      await readFile(join(destination, "package.json"), "utf8"),
    );

    // then a generated app is publishable; the template never is.
    expect(pkg).not.toHaveProperty("private");
  });

  it("rewrites the template's name and port wherever they appear", async () => {
    // when
    const destination = await generate();

    // then
    expect(await readFile(join(destination, "README.md"), "utf8")).toBe(
      "# feed-sync\nPort 8010.\n",
    );
    expect(await readFile(join(destination, ".env.example"), "utf8")).toBe(
      "BUILD_TARGET=vercel\nPORT=8010\n",
    );
  });

  it("normalises a name that is not already a directory name", async () => {
    // when
    const destination = await createApp({
      description: "Anything",
      name: "  Feed Sync!  ",
      port: "8010",
      root,
      target: "vercel",
    });

    // then `--args` skips the prompt that would have filtered it.
    expect(destination).toBe(join(root, "apps", "feed-sync"));
  });

  it("leaves local state behind", async () => {
    // given a template someone has run locally
    await write(join(template(), ".env"), "SALEOR_APP_TOKEN=secret\n");
    await write(join(template(), "dist", "entry-server.js"), "built");
    await write(join(template(), ".saleor-app-config.json"), "{}");

    // when
    const destination = await generate();

    // then copying `.env` would hand the new app someone else's token.
    await expect(readFile(join(destination, ".env"), "utf8")).rejects.toThrow();
    await expect(
      readFile(join(destination, "dist", "entry-server.js"), "utf8"),
    ).rejects.toThrow();
    await expect(
      readFile(join(destination, ".saleor-app-config.json"), "utf8"),
    ).rejects.toThrow();
  });

  it("leaves Vercel's config behind for an app deployed elsewhere", async () => {
    // when
    const destination = await generate("node");

    // then
    await expect(
      readFile(join(destination, "vercel.json"), "utf8"),
    ).rejects.toThrow();
    expect(await readFile(join(destination, ".env.example"), "utf8")).toContain(
      "BUILD_TARGET=node",
    );
  });

  it("refuses to write over an app that already exists", async () => {
    // given
    await generate();

    // when / then
    await expect(generate()).rejects.toThrow();
  });
});
