import { describe, expect, it } from "vitest";

import { isLocalDomain } from "./util"; // Adjust import as needed

describe("util", () => {
  describe("isLocalDomain", () => {
    it("returns true for localhost", () => {
      // given
      const url = "http://localhost:3000";
      // when
      const result = isLocalDomain(url);
      // then

      expect(result).toBe(true);
    });
    it("returns true for 127.0.0.1", () => {
      // given
      const url = "http://127.0.0.1:8080";
      // when
      const result = isLocalDomain(url);
      // then

      expect(result).toBe(true);
    });
    it("returns false for an external domain", () => {
      // given
      const url = "https://example.com";
      // when
      const result = isLocalDomain(url);
      // then

      expect(result).toBe(false);
    });
    it("returns false for an IP address other than 127.0.0.1", () => {
      // given
      const url = "http://192.168.1.1";
      // when
      const result = isLocalDomain(url);
      // then

      expect(result).toBe(false);
    });
    it("returns false for a subdomain of localhost", () => {
      // given
      const url = "http://my.localhost";
      // when
      const result = isLocalDomain(url);
      // then

      expect(result).toBe(false);
    });
  });
});
