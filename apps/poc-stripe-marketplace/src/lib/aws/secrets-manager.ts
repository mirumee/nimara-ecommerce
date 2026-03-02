import {
  CreateSecretCommand,
  GetSecretValueCommand,
  PutSecretValueCommand,
  ResourceNotFoundException,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

import { CONFIG } from "@/config";

function createClient(): SecretsManagerClient {
  const clientConfig: Record<string, unknown> = {
    region: CONFIG.AWS_REGION,
  };

  if (CONFIG.AWS_ENDPOINT_URL) {
    clientConfig.endpoint = CONFIG.AWS_ENDPOINT_URL;
  }

  clientConfig.credentials = {
    accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
    secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
    sessionToken: CONFIG.AWS_SESSION_TOKEN,
  };

  return new SecretsManagerClient(clientConfig);
}

let clientInstance: SecretsManagerClient | null = null;

function getClient(): SecretsManagerClient {
  if (!clientInstance) {
    clientInstance = createClient();
  }

  return clientInstance;
}

export async function getSecret<T = Record<string, unknown>>(
  secretId: string,
): Promise<T | null> {
  const client = getClient();

  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretId }),
    );

    if (!response.SecretString) {
      return null;
    }

    return JSON.parse(response.SecretString) as T;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      return null;
    }

    throw error;
  }
}

export async function putSecret<T = Record<string, unknown>>(
  secretId: string,
  value: T,
): Promise<void> {
  const client = getClient();

  try {
    await client.send(
      new PutSecretValueCommand({
        SecretId: secretId,
        SecretString: JSON.stringify(value),
      }),
    );
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      await client.send(
        new CreateSecretCommand({
          Name: secretId,
          SecretString: JSON.stringify(value),
        }),
      );

      return;
    }

    throw error;
  }
}
