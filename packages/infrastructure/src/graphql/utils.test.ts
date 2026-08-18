import { describe, expect, it } from "vitest";

import { getOperationName } from "./utils";

describe("utils", () => {
  describe("getOperationName", () => {
    it("extracts a query name", () => {
      expect(getOperationName("query AppIdQuery { app { id } }")).toBe(
        "AppIdQuery",
      );
    });

    it("extracts a mutation name", () => {
      expect(
        getOperationName(
          "mutation UpdateMetadata($id: ID!) { updateMetadata }",
        ),
      ).toBe("UpdateMetadata");
    });

    it("extracts a subscription name", () => {
      expect(
        getOperationName("subscription OrderUpdated { event { __typename } }"),
      ).toBe("OrderUpdated");
    });

    it("is case-insensitive on the operation keyword", () => {
      expect(getOperationName("QUERY Foo { a }")).toBe("Foo");
    });

    it("handles a name immediately followed by variables", () => {
      expect(getOperationName("query Foo($id: ID!) { a }")).toBe("Foo");
    });

    it("joins multiple operations with a comma", () => {
      const document = `
        query First { a }
        mutation Second($x: Int!) { b }
      `;

      expect(getOperationName(document)).toBe("First, Second");
    });

    it("returns an empty string when there is no named operation", () => {
      expect(getOperationName("{ a b c }")).toBe("");
    });
  });
});
