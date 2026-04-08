import { getAppConfig } from "@/lib/saleor/app-config";
import {
  getSaleorDomainFromToken,
  getSaleorGraphQLEndpoint,
} from "@/lib/saleor/domain";
import type { MetadataItem } from "@/lib/saleor/vendor-payment-metadata";

type GraphQLError = {
  message?: string;
};

type GraphQLResponse<TData> = {
  data?: TData;
  errors?: GraphQLError[];
};

function getErrorMessage(errors?: GraphQLError[]): string {
  return (
    errors
      ?.map((error) => error.message)
      .filter(Boolean)
      .join("; ") || "Saleor GraphQL operation failed"
  );
}

async function executeSaleorAppGraphQL<TData>(
  saleorDomain: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<TData> {
  const appConfig = await getAppConfig(saleorDomain);

  if (!appConfig?.authToken) {
    throw new Error(
      `Missing app auth token for Saleor domain: ${saleorDomain}`,
    );
  }

  const configData = appConfig.config;
  const apiUrl =
    typeof configData?.apiUrl === "string"
      ? String(configData.apiUrl)
      : getSaleorGraphQLEndpoint(saleorDomain);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${appConfig.authToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = (await response.json()) as GraphQLResponse<TData>;

  if (!response.ok) {
    throw new Error(`Saleor GraphQL failed with status ${response.status}`);
  }

  if (body.errors?.length) {
    throw new Error(getErrorMessage(body.errors));
  }

  if (!body.data) {
    throw new Error("Saleor GraphQL returned empty data");
  }

  return body.data;
}

export function resolveSaleorDomainFromToken(token: string): string {
  const saleorDomain = getSaleorDomainFromToken(token);

  if (!saleorDomain) {
    throw new Error("Cannot resolve Saleor domain from token");
  }

  return saleorDomain;
}

export async function getVendorPageMetadata(input: {
  saleorDomain: string;
  vendorPageId: string;
}): Promise<MetadataItem[]> {
  const query = `
    query VendorPageMetadata($id: ID!) {
      page(id: $id) {
        id
        metadata {
          key
          value
        }
      }
    }
  `;

  const data = await executeSaleorAppGraphQL<{
    page?: { metadata?: MetadataItem[] | null } | null;
  }>(input.saleorDomain, query, { id: input.vendorPageId });

  return data.page?.metadata ?? [];
}

export async function updateVendorPageMetadata(input: {
  metadata: MetadataItem[];
  saleorDomain: string;
  vendorPageId: string;
}): Promise<void> {
  const mutation = `
    mutation UpdateVendorPageMetadata($id: ID!, $input: [MetadataInput!]!) {
      updateMetadata(id: $id, input: $input) {
        errors {
          message
        }
      }
    }
  `;

  const data = await executeSaleorAppGraphQL<{
    updateMetadata?: { errors?: GraphQLError[] | null } | null;
  }>(input.saleorDomain, mutation, {
    id: input.vendorPageId,
    input: input.metadata,
  });

  const errors = data.updateMetadata?.errors ?? [];

  if (errors.length > 0) {
    throw new Error(getErrorMessage(errors));
  }
}
