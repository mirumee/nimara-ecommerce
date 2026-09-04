import { afterEach, describe, expect, it } from "vitest";

import { requireAwsEnvironment } from "./env";

describe("requireAwsEnvironment", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  const validEnv = {
    AWS_ACCESS_KEY_ID: "dummy",
    AWS_REGION: "eu-central-1",
    AWS_SECRET_ACCESS_KEY: "dummy",
  };

  it("passes with the required keys set", () => {
    // given
    Object.assign(process.env, validEnv);

    // when / then
    expect(() => requireAwsEnvironment("AWS Parameter Store")).not.toThrow();
  });

  it("passes with a blank AWS_ENDPOINT_URL, treated as unset", () => {
    // given
    Object.assign(process.env, validEnv, { AWS_ENDPOINT_URL: "" });

    // when / then
    expect(() => requireAwsEnvironment("AWS Parameter Store")).not.toThrow();
  });

  it("passes with a real AWS_ENDPOINT_URL", () => {
    // given
    Object.assign(process.env, validEnv, {
      AWS_ENDPOINT_URL: "http://localhost:4566",
    });

    // when / then
    expect(() => requireAwsEnvironment("AWS Parameter Store")).not.toThrow();
  });

  it("throws naming the caller and the missing key", () => {
    // given
    Object.assign(process.env, validEnv);
    delete process.env.AWS_REGION;

    // when / then
    expect(() => requireAwsEnvironment("AWS Parameter Store")).toThrow(
      /Invalid AWS Parameter Store env:.*AWS_REGION/,
    );
  });

  it("throws on an invalid AWS_ENDPOINT_URL", () => {
    // given
    Object.assign(process.env, validEnv, { AWS_ENDPOINT_URL: "not-a-url" });

    // when / then
    expect(() => requireAwsEnvironment("AWS Secrets Manager")).toThrow(
      /Invalid AWS Secrets Manager env:.*AWS_ENDPOINT_URL/,
    );
  });
});
