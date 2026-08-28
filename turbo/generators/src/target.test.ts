import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { kindsForTarget } from "./names";
import { detectBuildTarget } from "./target";

let root: string;

const app = (contents: string) =>
  writeFile(join(root, "apps", "feed-sync", ".env.example"), contents);

describe("target", () => {
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "nimara-gen-"));

    await mkdir(join(root, "apps", "feed-sync"), { recursive: true });
  });

  afterEach(() => rm(root, { force: true, recursive: true }));

  describe("detectBuildTarget", () => {
    it("reads the target the app was generated with", async () => {
      // given
      await app("ENVIRONMENT=local\nBUILD_TARGET=vercel\nPORT=8000\n");

      // when / then a service added later inherits it, and is never asked.
      expect(detectBuildTarget({ app: "feed-sync", root })).toBe("vercel");
    });

    it("falls back to the target that can run anything", async () => {
      // given an app whose `.env.example` names no target
      await app("ENVIRONMENT=local\n");

      // when / then the build refuses what the platform cannot serve, so a
      // wrong guess here fails loudly rather than silently narrowing a prompt.
      expect(detectBuildTarget({ app: "feed-sync", root })).toBe("node");
    });
  });

  describe("kindsForTarget", () => {
    it("hides the queue kind from a Vercel app", () => {
      // when / then nothing on Vercel polls a queue.
      expect(kindsForTarget("vercel")).not.toContain("queue");
    });

    it("offers every kind on node", () => {
      // when / then
      expect(kindsForTarget("node")).toContain("queue");
    });
  });
});
