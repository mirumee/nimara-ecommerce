import {
  CreateSecretCommand,
  GetSecretValueCommand,
  PutSecretValueCommand,
  ResourceNotFoundException,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

interface SecretsManagerConfig {
  accessKeyId?: string;
  endpoint?: string;
  region?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}

function createClient(config?: SecretsManagerConfig): SecretsManagerClient {
  const clientConfig: Record<string, unknown> = {
    region: config?.region || process.env.AWS_REGION || "ap-southeast-1",
  };

  if (config?.endpoint || process.env.AWS_ENDPOINT_URL) {
    clientConfig.endpoint = config?.endpoint || process.env.AWS_ENDPOINT_URL;
  }

  if (config?.accessKeyId || process.env.AWS_ACCESS_KEY_ID) {
    clientConfig.credentials = {
      accessKeyId: config?.accessKeyId || process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey:
        config?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY || "",
      sessionToken: config?.sessionToken || process.env.AWS_SESSION_TOKEN,
    };
  }

  return new SecretsManagerClient(clientConfig);
}

let clientInstance: SecretsManagerClient | null = null;

function getClient(): SecretsManagerClient {
  if (!clientInstance) {
    clientInstance = createClient();
  }

  return clientInstance;
}

/**
 * Get a secret value from AWS Secrets Manager
 */
export async function getSecret<T = Record<string, unknown>>(
  secretId: string,
): Promise<T | null> {
  const client = getClient();

  try {
    const command = new GetSecretValueCommand({ SecretId: secretId });
    const response = await client.send(command);

    if (response.SecretString) {
      return JSON.parse(response.SecretString) as T;
    }

    return null;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      return null;
    }
    throw error;
  }
}

/**
 * Store a secret value in AWS Secrets Manager
 */
export async function putSecret<T = Record<string, unknown>>(
  secretId: string,
  value: T,
): Promise<void> {
  const client = getClient();

  try {
    const command = new PutSecretValueCommand({
      SecretId: secretId,
      SecretString: JSON.stringify(value),
    });

    await client.send(command);
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      // Secret doesn't exist, create it
      const createCommand = new CreateSecretCommand({
        Name: secretId,
        SecretString: JSON.stringify(value),
      });

      await client.send(createCommand);
    } else {
      throw error;
    }
  }
}

/**
 * Get a specific key from a secret
 */
export async function getSecretValue<T = string>(
  secretId: string,
  key: string,
): Promise<T | null> {
  const secret = await getSecret<Record<string, T>>(secretId);

  return secret?.[key] ?? null;
}

/**
 * Update a specific key in a secret
 */
export async function updateSecretValue<T = string>(
  secretId: string,
  key: string,
  value: T,
): Promise<void> {
  const existing = (await getSecret<Record<string, unknown>>(secretId)) || {};

  await putSecret(secretId, { ...existing, [key]: value });
}
