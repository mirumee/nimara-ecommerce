import type * as SsmModule from "@aws-sdk/client-ssm";
import { PutParameterCommand } from "@aws-sdk/client-ssm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type BootstrapLogger } from "./localstack.ts";
import { ensureParameterStore } from "./ssm.ts";

const mocks = vi.hoisted(() => ({
  sendError: null as Error | null,
  sent: [] as unknown[],
}));

vi.mock("@aws-sdk/client-ssm", async (importOriginal) => ({
  ...(await importOriginal<typeof SsmModule>()),
  SSMClient: class {
    send(command: unknown) {
      mocks.sent.push(command);

      if (mocks.sendError) {
        return Promise.reject(mocks.sendError);
      }

      return Promise.resolve({});
    }
  },
}));

const info = vi.fn();
const logger: BootstrapLogger = { error: vi.fn(), info, warning: vi.fn() };

beforeEach(() => {
  mocks.sent.length = 0;
  mocks.sendError = null;
  info.mockClear();
  vi.unstubAllEnvs();
});

describe("ensureParameterStore", () => {
  it("creates the namespace marker against a local endpoint", async () => {
    // given
    vi.stubEnv("AWS_ENDPOINT_URL", "http://localhost:4566");

    // when
    await ensureParameterStore({ logger, storePath: "/nimara/app-config" });

    // then
    expect(mocks.sent).toEqual([
      expect.objectContaining({
        input: {
          Name: "/nimara/app-config/.namespace",
          Overwrite: true,
          Type: "String",
          Value: "init",
        },
      }),
    ]);
    expect(mocks.sent[0]).toBeInstanceOf(PutParameterCommand);
  });

  it("creates nothing without one, and says so", async () => {
    // given
    vi.stubEnv("AWS_ENDPOINT_URL", "");

    // when
    await ensureParameterStore({ logger, storePath: "/nimara/app-config" });

    // then
    expect(mocks.sent).toEqual([]);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("AWS_ENDPOINT_URL is not set"),
    );
  });

  it("propagates LocalStack failures to the runtime wrapper", async () => {
    // given
    vi.stubEnv("AWS_ENDPOINT_URL", "http://localhost:4566");
    mocks.sendError = new Error("connect ECONNREFUSED");

    // when
    await expect(
      ensureParameterStore({ logger, storePath: "/nimara/app-config" }),
    ).rejects.toThrow("connect ECONNREFUSED");

    // then
  });
});
