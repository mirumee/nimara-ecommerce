"use server";

import crypto from "node:crypto";

import type { BaseError } from "@nimara/domain/objects/Error";
import { err } from "@nimara/domain/objects/Result";
import { graphqlClient } from "@nimara/infrastructure/graphql/client";

import {
  ChannelsDocument,
  CollectionChannelListingUpdateMutationDocument,
  CustomerByEmailDocument,
  CustomerDeleteMutationDocument,
  MetadataUpdateDocument,
  RegisterAccountDocument,
  VendorCollectionCreateDocument,
  VendorCollectionDeleteDocument,
  VendorPageCreateDocument,
  VendorPageDeleteDocument,
  VendorPageTypeDocument,
} from "@/graphql/generated/client";
import { config } from "@/lib/config";
import { sendNewVendorRegisteredEmailToSuperadmin } from "@/lib/email";
import { executeGraphQL } from "@/lib/graphql/execute";
import { getAppConfig } from "@/lib/saleor/app-config";
import { METADATA_KEYS } from "@/lib/saleor/consts";

type AppError = BaseError<"ACCOUNT_REGISTER_ERROR">;

function failConfigured(stage: string, details?: Record<string, unknown>) {
  // Server-side debug: helps pinpoint which step failed (no secrets/tokens).
  console.error("[sign-up] Vendor registration is not configured", {
    stage,
    ...(details ?? {}),
  });

  return err<AppError>([
    {
      code: "ACCOUNT_REGISTER_ERROR",
      message: "Vendor registration is not configured.",
    },
  ]);
}

function failSetup(stage: string, details?: Record<string, unknown>) {
  // Server-side debug: helps pinpoint which step failed (no secrets/tokens).
  console.error("[sign-up] Vendor setup failed", {
    stage,
    ...(details ?? {}),
  });

  return err<AppError>([
    {
      code: "ACCOUNT_REGISTER_ERROR",
      message: "Vendor setup failed. Please try again.",
    },
  ]);
}

function firstSaleorErrorMessage(
  errors:
    | Array<{ field?: string | null; message?: string | null }>
    | null
    | undefined,
): string | undefined {
  const msg = errors?.find((e) => e?.message)?.message ?? undefined;

  return msg ?? undefined;
}

function toEditorJsRichText(text: string): string {
  return JSON.stringify({
    time: 0,
    blocks: [
      {
        type: "paragraph",
        data: { text },
      },
    ],
    version: "2.28.2",
  });
}

function slugify(input: string): string {
  const normalized = input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  const slug = normalized
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug.length ? slug.slice(0, 80) : "vendor";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function lookupCustomerIdByEmail(
  saleor: ReturnType<typeof graphqlClient>,
  email: string,
): Promise<string | null> {
  const lookup = await saleor.execute(CustomerByEmailDocument, {
    operationName: "CustomerByEmailQuery",
    variables: { search: email },
    options: { cache: "no-store" },
  });

  if (!lookup.ok) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const edges = lookup.data.customers?.edges ?? [];

  const exactMatch = edges.find((edge) => {
    const candidateEmail = edge?.node?.email;
    const candidateId = edge?.node?.id;

    return (
      isNonEmptyString(candidateEmail) &&
      candidateEmail.trim().toLowerCase() === normalizedEmail &&
      isNonEmptyString(candidateId)
    );
  });

  if (isNonEmptyString(exactMatch?.node?.id)) {
    return exactMatch.node.id;
  }

  const firstValidId = edges.find((edge) => isNonEmptyString(edge?.node?.id))
    ?.node?.id;

  return isNonEmptyString(firstValidId) ? firstValidId : null;
}

function getSaleorDomainFromEnv(): string {
  const url = process.env.NEXT_PUBLIC_SALEOR_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SALEOR_URL is not set");
  }

  return new URL(url).hostname;
}

async function safeRollback(opts: {
  customerId?: string;
  saleor: ReturnType<typeof graphqlClient>;
  vendorCollectionId?: string;
  vendorPageId?: string;
}) {
  const { saleor, vendorCollectionId, vendorPageId, customerId } = opts;

  // Best-effort rollback (ignore errors)
  if (customerId) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await saleor.execute(CustomerDeleteMutationDocument, {
      operationName: "CustomerDeleteMutation",
      variables: { id: customerId },
      options: { cache: "no-store" },
    });
  }

  if (vendorCollectionId) {
    await saleor.execute(VendorCollectionDeleteDocument, {
      operationName: "VendorCollectionDeleteMutation",
      variables: { id: vendorCollectionId },
      options: { cache: "no-store" },
    });
  }

  if (vendorPageId) {
    await saleor.execute(VendorPageDeleteDocument, {
      operationName: "VendorPageDeleteMutation",
      variables: { id: vendorPageId },
      options: { cache: "no-store" },
    });
  }
}

export async function registerAccount(input: {
  channel: string;
  companyName: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  redirectUrl: string;
  vatId: string;
  vendorDescription?: string;
  vendorName: string;
}) {
  let saleorDomain: string;

  try {
    saleorDomain = getSaleorDomainFromEnv();
  } catch (e) {
    return failConfigured("getSaleorDomainFromEnv", {
      error: e instanceof Error ? e.message : String(e),
    });
  }

  let appConfig: Awaited<ReturnType<typeof getAppConfig>>;

  try {
    appConfig = await getAppConfig(saleorDomain);
  } catch (e) {
    return failConfigured("getAppConfig_exception", {
      saleorDomain,
      appConfigProvider: config.appConfig.provider,
      ...(config.appConfig.provider === "aws"
        ? { secretPath: config.aws.secretManagerPath }
        : {
            edgeConfigId: config.appConfig.edge.edgeConfigId,
            configKey: config.appConfig.edge.configKey,
          }),
      error: e instanceof Error ? e.message : String(e),
    });
  }

  if (!appConfig?.authToken) {
    return failConfigured("getAppConfig_missing", {
      saleorDomain,
      appConfigProvider: config.appConfig.provider,
      ...(config.appConfig.provider === "aws"
        ? { secretPath: config.aws.secretManagerPath }
        : {
            edgeConfigId: config.appConfig.edge.edgeConfigId,
            configKey: config.appConfig.edge.configKey,
          }),
      hasAppConfig: Boolean(appConfig),
      hasAuthToken: Boolean(appConfig?.authToken),
      appConfigDomain: appConfig?.saleorDomain,
      hasApiUrl: typeof (appConfig?.config as any)?.apiUrl === "string",
    });
  }

  const apiUrl =
    typeof (appConfig.config as any)?.apiUrl === "string"
      ? String((appConfig.config as any).apiUrl)
      : `https://${saleorDomain}/graphql/`;

  const saleor = graphqlClient(apiUrl, appConfig.authToken);

  const { companyName, vatId, vendorDescription, vendorName } = input;

  // 1) Create vendor (page + collection) first.
  const resultVendorType = await saleor.execute(VendorPageTypeDocument, {
    operationName: "VendorPageTypeQuery",
    variables: { slug: "vendor-profile" },
    options: { cache: "no-store" },
  });

  if (!resultVendorType.ok) {
    return failConfigured("vendorPageType_query_failed", {
      saleorDomain,
      apiUrl,
      operationName: "VendorPageTypeQuery",
      errors: resultVendorType.errors,
    });
  }

  const vendorPageType = resultVendorType.data.pageTypes?.edges?.[0]?.node;

  const statusAttr = vendorPageType?.attributes?.find(
    (a) => a?.slug === "vendor-status",
  );
  const nameAttr = vendorPageType?.attributes?.find(
    (a) => a?.slug === "vendor-name",
  );
  const companyNameAttr = vendorPageType?.attributes?.find(
    (a) => a?.slug === "company-name",
  );
  const vatIdAttr = vendorPageType?.attributes?.find(
    (a) => a?.slug === "vat-id",
  );
  const descriptionAttr = vendorPageType?.attributes?.find(
    (a) => a?.slug === "description",
  );

  if (!vendorPageType?.id || !statusAttr?.id) {
    return failConfigured("vendorPageType_missing_or_statusAttr_missing", {
      saleorDomain,
      apiUrl,
      hasVendorPageType: Boolean(vendorPageType),
      vendorPageTypeId: vendorPageType?.id,
      vendorPageTypeSlug: vendorPageType?.slug,
      hasStatusAttr: Boolean(statusAttr?.id),
      availableAttrSlugs: vendorPageType?.attributes?.map((a) => a.slug) ?? [],
    });
  }

  const uniqueSuffix = crypto.randomUUID().slice(0, 8);

  const vendorSlug = `vendor-${slugify(vendorName)}`;

  const pageInput: any = {
    title: vendorName,
    slug: vendorSlug,
    isPublished: false,
    pageType: vendorPageType.id,
    attributes: [
      {
        id: statusAttr.id,
        dropdown: { value: "pending" },
      },
      ...(nameAttr?.id
        ? [
            {
              id: nameAttr.id,
              plainText: vendorName,
            },
          ]
        : []),
      ...(companyNameAttr?.id
        ? [
            {
              id: companyNameAttr.id,
              plainText: companyName,
            },
          ]
        : []),
      ...(vatIdAttr?.id
        ? [
            {
              id: vatIdAttr.id,
              plainText: vatId,
            },
          ]
        : []),
      ...(descriptionAttr?.id && vendorDescription
        ? [
            {
              id: descriptionAttr.id,
              richText: toEditorJsRichText(vendorDescription),
            },
          ]
        : []),
    ],
  };

  const resultCreateVendor = await saleor.execute(VendorPageCreateDocument, {
    operationName: "VendorPageCreateMutation",
    variables: { input: pageInput },
    options: { cache: "no-store" },
  });

  if (!resultCreateVendor.ok) {
    return failSetup("vendor_pageCreate_request_failed", {
      errors: resultCreateVendor.errors,
      operationName: "VendorPageCreateMutation",
    });
  }

  const vendorCreatePayload = resultCreateVendor.data.pageCreate;

  if (!vendorCreatePayload) {
    return failSetup("vendor_pageCreate_missing_payload");
  }

  if ((vendorCreatePayload?.errors ?? []).length > 0) {
    return failSetup("vendor_pageCreate_validation_errors", {
      errors: vendorCreatePayload.errors,
      message: firstSaleorErrorMessage(vendorCreatePayload.errors),
    });
  }

  const vendorPageId = vendorCreatePayload?.page?.id;

  if (!vendorPageId) {
    return failSetup("vendor_pageCreate_missing_pageId");
  }

  const collectionSlug = `vendor-${slugify(vendorName)}-${uniqueSuffix}`;
  const collectionInput: any = {
    name: `${vendorName} — Products`,
    slug: collectionSlug,
    isPublished: true,
    metadata: [{ key: "vendor.model_id", value: vendorPageId }],
  };

  const resultCreateCollection = await saleor.execute(
    VendorCollectionCreateDocument,
    {
      operationName: "VendorCollectionCreateMutation",
      variables: { input: collectionInput },
      options: { cache: "no-store" },
    },
  );

  if (!resultCreateCollection.ok) {
    return failSetup("vendor_collectionCreate_request_failed", {
      errors: resultCreateCollection.errors,
      operationName: "VendorCollectionCreateMutation",
    });
  }

  const collectionPayload = resultCreateCollection.data.collectionCreate;

  if (!collectionPayload) {
    return failSetup("vendor_collectionCreate_missing_payload");
  }

  if ((collectionPayload?.errors ?? []).length > 0) {
    return failSetup("vendor_collectionCreate_validation_errors", {
      errors: collectionPayload.errors,
      message: firstSaleorErrorMessage(collectionPayload.errors),
    });
  }

  const vendorCollectionId = collectionPayload?.collection?.id;

  if (!vendorCollectionId) {
    await safeRollback({ saleor, vendorPageId });

    return failSetup("vendor_collectionCreate_missing_collectionId");
  }

  // 2) Create customer after vendor is created.
  const resultRegister = await executeGraphQL(
    RegisterAccountDocument,
    "RegisterAccountMutation",
    {
      input: {
        channel: input.channel,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        password: input.password,
        redirectUrl: input.redirectUrl,
      },
    },
  );

  if (!resultRegister.ok) {
    await safeRollback({ saleor, vendorCollectionId, vendorPageId });

    return resultRegister;
  }

  const payload = (resultRegister.data as any)?.accountRegister as
    | { errors?: Array<{ message?: string | null }>; user?: { id: string } }
    | undefined;

  if (!payload) {
    await safeRollback({ saleor, vendorCollectionId, vendorPageId });

    return failSetup("customer_accountRegister_missing_payload");
  }

  if ((payload.errors ?? []).length > 0) {
    await safeRollback({ saleor, vendorCollectionId, vendorPageId });
    // Keep current behavior: frontend maps Saleor accountRegister errors.

    return resultRegister;
  }

  const customerId = payload.user?.id || null;

  const requiresConfirmation =
    (payload as any)?.requiresConfirmation != null
      ? Boolean((payload as any).requiresConfirmation)
      : undefined;

  const resolvedCustomerId = await (async () => {
    if (isNonEmptyString(customerId)) {
      return customerId;
    }

    // Some Saleor setups return user.id as empty string / null for accountRegister.
    // Customer may appear with a small delay, so retry lookup with short backoff.
    const maxAttempts = 5;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const foundCustomerId = await lookupCustomerIdByEmail(
        saleor,
        input.email,
      );

      if (isNonEmptyString(foundCustomerId)) {
        return foundCustomerId;
      }

      if (attempt < maxAttempts) {
        await wait(attempt * 200);
      }
    }

    return null;
  })();

  if (!resolvedCustomerId) {
    await safeRollback({ saleor, vendorCollectionId, vendorPageId });

    return failSetup("customer_accountRegister_missing_userId", {
      attemptedLookupByEmail: true,
      lookupEmail: input.email,
      requiresConfirmation,
      returnedUser: payload.user ?? null,
    });
  }

  // Mark collection as default and attach vendor ID
  const resultCollectionMetadata = await saleor.execute(
    MetadataUpdateDocument,
    {
      operationName: "MetadataUpdateMutation",
      variables: {
        id: vendorCollectionId,
        input: [
          { key: METADATA_KEYS.VENDOR_ID, value: vendorPageId },
          { key: METADATA_KEYS.VENDOR_DEFAULT_COLLECTION, value: "true" },
        ],
      },
      options: { cache: "no-store" },
    },
  );

  if (!resultCollectionMetadata.ok) {
    await safeRollback({
      customerId: resolvedCustomerId,
      saleor,
      vendorCollectionId,
      vendorPageId,
    });

    return failSetup("collection_updateMetadata_request_failed", {
      errors: resultCollectionMetadata.errors,
      operationName: "MetadataUpdateMutation",
    });
  }

  const updateCollectionMetaPayload =
    resultCollectionMetadata.data.updateMetadata;

  if (!updateCollectionMetaPayload) {
    await safeRollback({
      customerId: resolvedCustomerId,
      saleor,
      vendorCollectionId,
      vendorPageId,
    });

    return failSetup("collection_updateMetadata_missing_payload");
  }

  if ((updateCollectionMetaPayload.errors ?? []).length > 0) {
    await safeRollback({
      customerId: resolvedCustomerId,
      saleor,
      vendorCollectionId,
      vendorPageId,
    });

    return failSetup("collection_updateMetadata_validation_errors", {
      errors: updateCollectionMetaPayload.errors,
      message: firstSaleorErrorMessage(updateCollectionMetaPayload.errors),
    });
  }

  // Set all channels visibility to hidden for the collection
  const channelsResult = await saleor.execute(ChannelsDocument, {
    operationName: "ChannelsQuery",
    variables: {},
    options: { cache: "no-store" },
  });

  if (channelsResult.ok && channelsResult.data?.channels) {
    const channels = channelsResult.data.channels;
    const hiddenChannels = channels.map((channel) => ({
      channelId: channel.id,
      isPublished: false,
      publishedAt: null,
    }));

    if (hiddenChannels.length > 0) {
      const channelListingResult = await saleor.execute(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        CollectionChannelListingUpdateMutationDocument,
        {
          operationName: "CollectionChannelListingUpdateMutation",
          variables: {
            id: vendorCollectionId,
            input: {
              addChannels: hiddenChannels,
            },
          },
          options: { cache: "no-store" },
        },
      );

      // Log but don't fail if channel listing update fails - collection is still created
      if (!channelListingResult.ok) {
        console.warn("[sign-up] Failed to set collection channels to hidden", {
          errors: channelListingResult.errors,
          collectionId: vendorCollectionId,
        });
      } else {
        const channelListingData = channelListingResult.data as {
          collectionChannelListingUpdate?: {
            errors?: Array<{ message?: string | null }>;
          };
        } | null;

        if (
          channelListingData?.collectionChannelListingUpdate?.errors &&
          channelListingData.collectionChannelListingUpdate.errors.length > 0
        ) {
          console.warn(
            "[sign-up] Collection channel listing update had errors",
            {
              errors: channelListingData.collectionChannelListingUpdate.errors,
              collectionId: vendorCollectionId,
            },
          );
        }
      }
    }
  }

  const resultCustomerMetadata = await saleor.execute(MetadataUpdateDocument, {
    operationName: "MetadataUpdateMutation",
    variables: {
      id: resolvedCustomerId,
      input: [
        { key: "vendor.collection_id", value: vendorCollectionId },
        // vendor.id should contain vendor Page.id
        { key: "vendor.id", value: vendorPageId },
      ],
    },
    options: { cache: "no-store" },
  });

  if (!resultCustomerMetadata.ok) {
    await safeRollback({
      customerId: resolvedCustomerId,
      saleor,
      vendorCollectionId,
      vendorPageId,
    });

    return failSetup("customer_updateMetadata_request_failed", {
      errors: resultCustomerMetadata.errors,
      operationName: "MetadataUpdateMutation",
    });
  }

  const updateMetadataPayload = resultCustomerMetadata.data.updateMetadata;

  if (!updateMetadataPayload) {
    await safeRollback({
      customerId: resolvedCustomerId,
      saleor,
      vendorCollectionId,
      vendorPageId,
    });

    return failSetup("customer_updateMetadata_missing_payload");
  }

  const metaErrors = updateMetadataPayload.errors ?? [];

  if (metaErrors.length > 0) {
    await safeRollback({
      customerId: resolvedCustomerId,
      saleor,
      vendorCollectionId,
      vendorPageId,
    });

    return failSetup("customer_updateMetadata_validation_errors", {
      errors: metaErrors,
      message: firstSaleorErrorMessage(metaErrors),
    });
  }

  try {
    await sendNewVendorRegisteredEmailToSuperadmin({
      vendorName,
      companyName,
      vatId,
      contactEmail: input.email,
      vendorId: vendorPageId,
      vendorSlug,
    });
  } catch (error) {
    console.error(
      "[sign-up] Failed to send new vendor registration email",
      error,
    );
  }

  return resultRegister;
}
