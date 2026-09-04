import { type SQSEvent, type SQSRecord } from "aws-lambda";
import { describe, expect, it } from "vitest";

import { handler } from "@/services/consumer/entry-queue";

const event = (bodies: Record<string, string>): SQSEvent => ({
  Records: Object.entries(bodies).map(
    ([messageId, body]) => ({ body, messageId }) as SQSRecord,
  ),
});

describe("entry-queue", () => {
  describe("handler", () => {
    it("deletes a message it could process", async () => {
      // when
      const response = await handler(event({ "1": JSON.stringify({}) }));

      // then what is not reported is what the queue deletes.
      expect(response.batchItemFailures).toEqual([]);
    });

    it("reports the message it could not process, and only that one", async () => {
      // when
      const response = await handler(
        event({ "1": JSON.stringify({}), "2": "not json" }),
      );

      // then reporting the whole batch would redeliver the first message too.
      expect(response.batchItemFailures).toEqual([{ itemIdentifier: "2" }]);
    });
  });
});
