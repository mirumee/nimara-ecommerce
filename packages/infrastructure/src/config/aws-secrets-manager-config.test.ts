import type * as SecretsManagerModule from "@aws-sdk/client-secrets-manager";
import {
  CreateSecretCommand,
  PutSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { awsSecretsManagerConfigItem } from "./aws-secrets-manager-config";

const mocks = vi.hoisted(() => ({
  putReject: null as Error | null,
  reject: null as Error | null,
  response: undefined as unknown,
  sent: [] as unknown[],
}));

vi.mock("@aws-sdk/client-secrets-manager", async (importOriginal) => {
  const actual = await importOriginal<typeof SecretsManagerModule>();

  return {
    ...actual,
    SecretsManagerClient: class {
      send(command: InstanceType<typeof actual.PutSecretValueCommand>) {
        mocks.sent.push(command);

        if (command instanceof actual.GetSecretValueCommand) {
          if (mocks.reject) {
            return Promise.reject(mocks.reject);
          }

          return Promise.resolve(mocks.response);
        }

        if (
          command instanceof actual.PutSecretValueCommand &&
          mocks.putReject
        ) {
          return Promise.reject(mocks.putReject);
        }

        return Promise.resolve({});
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
  mocks.putReject = null;
  mocks.response = undefined;
  logger.error.mockClear();
});

describe("awsSecretsManagerConfigItem", () => {
  describe("get", () => {
    it("returns the parsed value from the secret", async () => {
      // given
      mocks.response = { SecretString: '{"secretKey":"abc"}' };
      const repository = awsSecretsManagerConfigItem({
        configKey: "nimara/app-config",
        logger,
        schema,
      });

      // when
      const result = await repository.get();

      // then
      expect(result).toEqual({ ok: true, data: { secretKey: "abc" } });
    });

    it("returns null when the secret has no string value", async () => {
      // given
      mocks.response = {};
      const repository = awsSecretsManagerConfigItem({
        configKey: "nimara/app-config",
        logger,
        schema,
      });

      // when
      const result = await repository.get();

      // then
      expect(result).toEqual({ ok: true, data: null });
    });

    it("returns null when the secret does not exist", async () => {
      // given
      const { ResourceNotFoundException } = await vi.importActual<
        typeof SecretsManagerModule
      >("@aws-sdk/client-secrets-manager");

      mocks.reject = new ResourceNotFoundException({
        $metadata: {},
        message: "not found",
      });
      const repository = awsSecretsManagerConfigItem({
        configKey: "nimara/app-config",
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
      const repository = awsSecretsManagerConfigItem({
        configKey: "nimara/app-config",
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
    });
  });

  describe("upsert", () => {
    it("puts the value into an existing secret", async () => {
      // given
      const repository = awsSecretsManagerConfigItem({
        configKey: "nimara/app-config",
        logger,
        schema,
      });

      // when
      const result = await repository.upsert({ value: { secretKey: "abc" } });

      // then
      expect(result).toEqual({ ok: true, data: { secretKey: "abc" } });
      expect(mocks.sent[0]).toBeInstanceOf(PutSecretValueCommand);
      expect((mocks.sent[0] as PutSecretValueCommand).input).toEqual({
        SecretId: "nimara/app-config",
        SecretString: '{"secretKey":"abc"}',
      });
    });

    it("creates the secret when it does not exist yet", async () => {
      // given
      const { ResourceNotFoundException } = await vi.importActual<
        typeof SecretsManagerModule
      >("@aws-sdk/client-secrets-manager");

      mocks.putReject = new ResourceNotFoundException({
        $metadata: {},
        message: "not found",
      });
      const repository = awsSecretsManagerConfigItem({
        configKey: "nimara/app-config",
        logger,
        schema,
      });

      // when
      const result = await repository.upsert({ value: { secretKey: "abc" } });

      // then
      expect(result).toEqual({ ok: true, data: { secretKey: "abc" } });
      expect(mocks.sent[1]).toBeInstanceOf(CreateSecretCommand);
      expect((mocks.sent[1] as CreateSecretCommand).input).toEqual({
        Name: "nimara/app-config",
        SecretString: '{"secretKey":"abc"}',
      });
    });

    it("returns a save error on any other failure", async () => {
      // given
      mocks.putReject = new Error("boom");
      const repository = awsSecretsManagerConfigItem({
        configKey: "nimara/app-config",
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
