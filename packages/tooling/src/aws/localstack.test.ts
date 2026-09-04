import { beforeEach, describe, expect, it, vi } from "vitest";

import { type BootstrapLogger, ensureLocalstackRuntime } from "./localstack.ts";

const warning = vi.fn();
const logger: BootstrapLogger = { error: vi.fn(), info: vi.fn(), warning };

beforeEach(() => warning.mockClear());

describe("ensureLocalstackRuntime", () => {
  it("warns and continues when LocalStack refuses the connection", async () => {
    const error = Object.assign(new Error("connection refused"), {
      code: "ECONNREFUSED",
    });

    await expect(
      ensureLocalstackRuntime(logger, "warning", async () => {
        throw error;
      }),
    ).resolves.toBeUndefined();
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining("LocalStack is unavailable"),
      expect.objectContaining({ cause: error }),
    );
  });

  it("preserves non-LocalStack failures", async () => {
    const error = new Error("bootstrap failed");

    await expect(
      ensureLocalstackRuntime(logger, "failure", async () => {
        throw error;
      }),
    ).rejects.toBe(error);
  });

  it("shares an in-flight operation for the same key", async () => {
    let calls = 0;
    const callback = async () => {
      calls += 1;
      await Promise.resolve();

      return true;
    };

    await Promise.all([
      ensureLocalstackRuntime(logger, "shared", callback),
      ensureLocalstackRuntime(logger, "shared", callback),
    ]);

    expect(calls).toBe(1);
  });
});
