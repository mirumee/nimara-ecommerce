import type * as SecretsManagerModule from "@aws-sdk/client-secrets-manager";
import {
  CreateSecretCommand,
  ResourceExistsException,
} from "@aws-sdk/client-secrets-manager";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type BootstrapLogger } from "./localstack.ts";
import { ensureSecretsManager } from "./secrets-manager.ts";

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(async (_command: unknown) => ({})),
}));

vi.mock("@aws-sdk/client-secrets-manager", async (importOriginal) => ({
  ...(await importOriginal<typeof SecretsManagerModule>()),
  SecretsManagerClient: class {
    send = sendMock;
  },
}));

const info = vi.fn();
const logger: BootstrapLogger = { error: vi.fn(), info, warning: vi.fn() };

beforeEach(() => {
  sendMock.mockClear();
  sendMock.mockResolvedValue({});
  info.mockClear();
  vi.unstubAllEnvs();
});

describe("ensureSecretsManager", () => {
  it("creates the secret against a local endpoint", async () => {
    // given
    vi.stubEnv("AWS_ENDPOINT_URL", "http://localhost:4566");

    // when
    await ensureSecretsManager({ logger, storePath: "/nimara/app-config" });

    // then
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: { Name: "/nimara/app-config", SecretString: "{}" },
      }),
    );
    expect(sendMock.mock.calls[0]?.[0]).toBeInstanceOf(CreateSecretCommand);
  });

  it("creates nothing without one, and says so", async () => {
    // given
    vi.stubEnv("AWS_ENDPOINT_URL", "");

    // when
    await ensureSecretsManager({ logger, storePath: "/nimara/app-config" });

    // then
    expect(sendMock).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("AWS_ENDPOINT_URL is not set"),
    );
  });

  it("leaves a secret already created by a concurrent start", async () => {
    // given
    vi.stubEnv("AWS_ENDPOINT_URL", "http://localhost:4566");
    sendMock.mockRejectedValueOnce(
      new ResourceExistsException({
        $metadata: {},
        message: "already exists",
      }),
    );

    // when & then
    await expect(
      ensureSecretsManager({ logger, storePath: "/nimara/app-config" }),
    ).resolves.toBeUndefined();
  });

  it("does not swallow another failure", async () => {
    // given
    vi.stubEnv("AWS_ENDPOINT_URL", "http://localhost:4566");
    sendMock.mockRejectedValueOnce(new Error("network down"));

    // when & then
    await expect(
      ensureSecretsManager({ logger, storePath: "/nimara/app-config" }),
    ).rejects.toThrow("network down");
  });
});
