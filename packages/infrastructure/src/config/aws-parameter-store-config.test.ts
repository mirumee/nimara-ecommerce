import type * as SsmModule from "@aws-sdk/client-ssm";
import { GetParameterCommand, PutParameterCommand } from "@aws-sdk/client-ssm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { awsParameterStoreConfigItem } from "./aws-parameter-store-config";

const mocks = vi.hoisted(() => ({
  reject: null as Error | null,
  response: undefined as unknown,
  sent: [] as unknown[],
}));

vi.mock("@aws-sdk/client-ssm", async (importOriginal) => {
  const actual = await importOriginal<typeof SsmModule>();

  return {
    ...actual,
    SSMClient: class {
      send(command: unknown) {
        mocks.sent.push(command);

        if (mocks.reject) {
          return Promise.reject(mocks.reject);
        }

        return Promise.resolve(mocks.response);
      }
    },
  };
});

const schema = z.object({ secretKey: z.string() });
const logger = {
  critical: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

beforeEach(() => {
  mocks.sent.length = 0;
  mocks.reject = null;
  mocks.response = undefined;
  logger.error.mockClear();
});

describe("awsParameterStoreConfigItem", () => {
  describe("get", () => {
    it("returns the parsed value from the parameter", async () => {
      // given
      mocks.response = { Parameter: { Value: '{"secretKey":"abc"}' } };
      const repository = awsParameterStoreConfigItem({
        configKey: "/nimara/app-config",
        logger,
        schema,
      });

      // when
      const result = await repository.get();

      // then
      expect(result).toEqual({ ok: true, data: { secretKey: "abc" } });
      expect(mocks.sent[0]).toBeInstanceOf(GetParameterCommand);
      expect((mocks.sent[0] as GetParameterCommand).input).toEqual({
        Name: "/nimara/app-config",
        WithDecryption: true,
      });
    });

    it("returns null when the parameter has no value", async () => {
      // given
      mocks.response = { Parameter: undefined };
      const repository = awsParameterStoreConfigItem({
        configKey: "/nimara/app-config",
        logger,
        schema,
      });

      // when
      const result = await repository.get();

      // then
      expect(result).toEqual({ ok: true, data: null });
    });

    it("returns null when the parameter does not exist", async () => {
      // given
      const { ParameterNotFound } = await vi.importActual<typeof SsmModule>(
        "@aws-sdk/client-ssm",
      );

      mocks.reject = new ParameterNotFound({
        $metadata: {},
        message: "not found",
      });
      const repository = awsParameterStoreConfigItem({
        configKey: "/nimara/app-config",
        logger,
        schema,
      });

      // when
      const result = await repository.get();

      // then
      expect(result).toEqual({ ok: true, data: null });
    });

    it("returns a fetch error on any other failure", async () => {
      // given
      mocks.reject = new Error("boom");
      const repository = awsParameterStoreConfigItem({
        configKey: "/nimara/app-config",
        logger,
        schema,
      });

      // when
      const result = await repository.get();

      // then
      expect(result.ok).toBe(false);
      expect(!result.ok && result.errors[0].code).toBe(
        "SALEOR_APP_CONFIG_FETCH_ERROR",
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("upsert", () => {
    it("writes the value as an encrypted overwrite", async () => {
      // given
      mocks.response = {};
      const repository = awsParameterStoreConfigItem({
        configKey: "/nimara/app-config",
        logger,
        schema,
      });

      // when
      const result = await repository.upsert({ value: { secretKey: "abc" } });

      // then
      expect(result).toEqual({ ok: true, data: { secretKey: "abc" } });
      expect(mocks.sent[0]).toBeInstanceOf(PutParameterCommand);
      expect((mocks.sent[0] as PutParameterCommand).input).toEqual({
        Name: "/nimara/app-config",
        Overwrite: true,
        Type: "SecureString",
        Value: '{"secretKey":"abc"}',
      });
    });

    it("returns a save error on failure", async () => {
      // given
      mocks.reject = new Error("boom");
      const repository = awsParameterStoreConfigItem({
        configKey: "/nimara/app-config",
        logger,
        schema,
      });

      // when
      const result = await repository.upsert({ value: { secretKey: "abc" } });

      // then
      expect(result.ok).toBe(false);
      expect(!result.ok && result.errors[0].code).toBe(
        "SALEOR_APP_CONFIG_SAVE_ERROR",
      );
    });
  });
});
