import { describe, expect, it } from "vitest";

import { getAppDisplayName } from "./utils";

describe("config utils", () => {
  describe("getAppDisplayName", () => {
    it.each([
      { expected: "Example", name: "@nimara/example" },
      { expected: "Feed generator", name: "@nimara/feed-generator" },
      { expected: "Feed generator", name: "@nimara/feed_generator" },
      { expected: "Stripe", name: "stripe" },
      { expected: "Sitemap generator", name: "sitemap-generator" },
      { expected: "", name: "" },
    ])("reads $name as $expected", ({ expected, name }) => {
      // when & then
      expect(getAppDisplayName(name)).toBe(expected);
    });
  });
});
