import type { BaseError } from "@nimara/domain/objects/Error";
import {
  type AsyncResult,
  err,
  ok,
  type Result,
} from "@nimara/domain/objects/Result";
import { graphqlClient } from "@nimara/infrastructure/graphql/client";

import {
  CustomerByEmailDocument,
  VendorPagePublishDocument,
} from "@/graphql/generated/client";
import { config } from "@/lib/config";
import { METADATA_KEYS } from "@/lib/saleor/consts";
import { marketplaceLogger } from "@/services/logging";

import { getAppConfig } from "./app-config";

type VendorPagePublicationError = BaseError<"ACCOUNT_CONFIRM_ERROR">;

function fail(
  stage: string,
  details?: Record<string, unknown>,
): Result<{ vendorPageId: string }, VendorPagePublicationError> {
  marketplaceLogger.error("Failed to publish vendor page", {
    stage,
    ...details,
  });

  return err<VendorPagePublicationError>([
    {
      code: "ACCOUNT_CONFIRM_ERROR",
      message: "Account confirmed, but vendor page publication failed.",
    },
  ]);
}

function getSaleorDomainFromEnv(): string {
  const url = process.env.NEXT_PUBLIC_SALEOR_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SALEOR_URL is not set");
  }

  return new URL(url).hostname;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getFirstSaleorErrorMessage(
  errors:
    | Array<{ field?: string | null; message?: string | null }>
    | null
    | undefined,
): string | undefined {
  return errors?.find((error) => error?.message)?.message ?? undefined;
}

export async function publishVendorPageForConfirmedAccount(
  email: string,
): AsyncResult<{ vendorPageId: string }, VendorPagePublicationError> {
  let saleorDomain: string;

  try {
    saleorDomain = getSaleorDomainFromEnv();
  } catch (error) {
    return fail("saleor_domain_missing", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  let appConfig: Awaited<ReturnType<typeof getAppConfig>>;

  try {
    appConfig = await getAppConfig(saleorDomain);
  } catch (error) {
    return fail("app_config_load_failed", {
      appConfigProvider: config.appConfig.provider,
      error: error instanceof Error ? error.message : String(error),
      saleorDomain,
    });
  }

  if (!appConfig?.authToken) {
    return fail("app_config_missing_auth_token", {
      appConfigProvider: config.appConfig.provider,
      saleorDomain,
    });
  }

  const apiUrl =
    typeof (appConfig.config as { apiUrl?: unknown })?.apiUrl === "string"
      ? String((appConfig.config as { apiUrl: string }).apiUrl)
      : `https://${saleorDomain}/graphql/`;

  const saleor = graphqlClient(apiUrl, appConfig.authToken);
  const customerResult = await saleor.execute(CustomerByEmailDocument, {
    operationName: "CustomerByEmailQuery",
    variables: { search: email },
    options: { cache: "no-store" },
  });

  if (!customerResult.ok) {
    return fail("customer_lookup_request_failed", {
      errors: customerResult.errors,
      operationName: "CustomerByEmailQuery",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const customer = customerResult.data.customers?.edges
    .map((edge) => edge?.node)
    .find(
      (node) =>
        isNonEmptyString(node?.email) &&
        node.email.trim().toLowerCase() === normalizedEmail,
    );

  const vendorPageId = customer?.metadata.find(
    (metadata) => metadata.key === METADATA_KEYS.VENDOR_ID,
  )?.value;

  if (!isNonEmptyString(vendorPageId)) {
    return fail("vendor_page_id_missing", {
      customerId: customer?.id,
      email,
    });
  }

  const publishResult = await saleor.execute(VendorPagePublishDocument, {
    operationName: "VendorPagePublishMutation",
    variables: {
      id: vendorPageId,
      input: {
        isPublished: true,
        publishedAt: new Date().toISOString(),
      },
    },
    options: { cache: "no-store" },
  });

  if (!publishResult.ok) {
    return fail("vendor_page_publish_request_failed", {
      errors: publishResult.errors,
      operationName: "VendorPagePublishMutation",
      vendorPageId,
    });
  }

  const payload = publishResult.data.pageUpdate;
  const errors = payload?.errors ?? [];

  if (!payload) {
    return fail("vendor_page_publish_missing_payload", { vendorPageId });
  }

  if (errors.length > 0) {
    return fail("vendor_page_publish_validation_errors", {
      errors,
      message: getFirstSaleorErrorMessage(errors),
      vendorPageId,
    });
  }

  if (!payload.page?.isPublished) {
    return fail("vendor_page_publish_not_published", { vendorPageId });
  }

  return ok({ vendorPageId });
}
