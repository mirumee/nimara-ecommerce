"use server";

import { revalidatePath } from "next/cache";

import { FileUploadMutationDocument } from "@/graphql/generated/client";
import { getServerAuthToken, getServerVendorId } from "@/lib/auth/server";
import { getAppConfig } from "@/lib/saleor/app-config";
import {
  getSaleorDomainFromToken,
  getSaleorGraphQLEndpoint,
} from "@/lib/saleor/domain";
import { configurationService } from "@/services/configuration";
import { vendorsService } from "@/services/vendors";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export type VendorBrandingKind = "logo" | "background";

function attributeSlugForKind(kind: VendorBrandingKind): string {
  return kind === "logo" ? "logo" : "background-image";
}

/**
 * Upload a single storefront branding image (logo or vendor PLP background).
 * Uses Saleor `fileUpload` (multipart) then `pageUpdate` with the returned URL on the vendor profile page FILE attribute.
 */
export async function uploadVendorBrandingImage(
  kind: VendorBrandingKind,
  file: File,
): Promise<
  | { data: { imageUrl: string }; ok: true }
  | { errors: Array<{ code: string; message: string }>; ok: false }
> {
  const userToken = await getServerAuthToken();

  if (!userToken) {
    return {
      errors: [{ code: "UNAUTHORIZED", message: "Authentication required" }],
      ok: false,
    };
  }

  const vendorPageId = await getServerVendorId();

  if (!vendorPageId) {
    return {
      errors: [
        {
          code: "NO_VENDOR",
          message: "No vendor profile linked to this account",
        },
      ],
      ok: false,
    };
  }

  if (!file.type.startsWith("image/")) {
    return {
      errors: [{ code: "INVALID_TYPE", message: "File must be an image" }],
      ok: false,
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      errors: [
        {
          code: "FILE_TOO_LARGE",
          message: "Image must be 10 MB or smaller",
        },
      ],
      ok: false,
    };
  }

  const slug = attributeSlugForKind(kind);
  const vendorResult = await configurationService.getVendorProfile(
    vendorPageId,
    userToken,
  );

  if (!vendorResult.ok || !vendorResult.data.page) {
    return {
      errors: [
        {
          code: "LOAD_FAILED",
          message: "Could not load vendor profile",
        },
      ],
      ok: false,
    };
  }

  const attr = vendorResult.data.page.attributes.find(
    (a) => a.attribute.slug === slug,
  );

  if (!attr?.attribute.id) {
    return {
      errors: [
        {
          code: "MISSING_ATTRIBUTE",
          message: `Vendor profile is missing the "${slug}" attribute`,
        },
      ],
      ok: false,
    };
  }

  const saleorDomain = getSaleorDomainFromToken(userToken);

  if (!saleorDomain) {
    return {
      errors: [
        {
          code: "CONFIG_ERROR",
          message: "Could not determine Saleor domain",
        },
      ],
      ok: false,
    };
  }

  const appConfig = await getAppConfig(saleorDomain);

  if (!appConfig?.authToken) {
    return {
      errors: [
        {
          code: "CONFIG_ERROR",
          message: "App not configured for this Saleor instance",
        },
      ],
      ok: false,
    };
  }

  const graphqlEndpoint = getSaleorGraphQLEndpoint(saleorDomain);
  const formData = new FormData();
  const operations = {
    query: FileUploadMutationDocument.toString(),
    variables: { file: null },
    operationName: "FileUploadMutation",
  };
  const map = { "0": ["variables.file"] };

  formData.append("operations", JSON.stringify(operations));
  formData.append("map", JSON.stringify(map));
  formData.append("0", file, file.name);

  let uploadResponse: Response;

  try {
    uploadResponse = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${appConfig.authToken}` },
      body: formData,
    });
  } catch (error) {
    return {
      errors: [
        {
          code: "UPLOAD_NETWORK_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to upload image",
        },
      ],
      ok: false,
    };
  }

  type UploadResponse = {
    data?: {
      fileUpload?: {
        errors: Array<{ code?: string; message?: string | null }>;
        uploadedFile?: { url: string } | null;
      } | null;
    };
    errors?: Array<{ message?: string }>;
  };
  let uploadJson: UploadResponse | null = null;

  try {
    uploadJson = (await uploadResponse.json()) as UploadResponse;
  } catch {
    return {
      errors: [
        {
          code: uploadResponse.ok ? "INVALID_RESPONSE" : "HTTP_ERROR",
          message: uploadResponse.ok
            ? "Invalid upload response from Saleor"
            : "Failed to upload image",
        },
      ],
      ok: false,
    };
  }

  if (!uploadResponse.ok) {
    return {
      errors: [
        {
          code: "HTTP_ERROR",
          message: uploadJson?.errors?.[0]?.message ?? "Failed to upload image",
        },
      ],
      ok: false,
    };
  }

  if (uploadJson?.errors?.length) {
    return {
      errors: uploadJson.errors.map((e) => ({
        code: "GRAPHQL_ERROR",
        message: e.message ?? "GraphQL error",
      })),
      ok: false,
    };
  }

  const uploadPayload = uploadJson?.data?.fileUpload;
  const uploadErrors = uploadPayload?.errors ?? [];

  if (uploadErrors.length > 0) {
    return {
      errors: uploadErrors.map((e) => ({
        code: e.code ?? "UPLOAD_ERROR",
        message: e.message ?? "Upload failed",
      })),
      ok: false,
    };
  }

  const fileUrl = uploadPayload?.uploadedFile?.url;

  if (!fileUrl) {
    return {
      errors: [{ code: "NO_URL", message: "No file URL returned from Saleor" }],
      ok: false,
    };
  }

  const pageUpdate = await vendorsService.updateVendorFileAttribute(
    vendorPageId,
    attr.attribute.id,
    fileUrl,
    userToken,
  );

  if (!pageUpdate.ok) {
    return {
      errors: pageUpdate.errors.map((e) => ({
        code: String(e.code ?? "PAGE_UPDATE"),
        message: e.message ?? "Failed to update vendor page",
      })),
      ok: false,
    };
  }

  const pageErrors = pageUpdate.data.pageUpdate.errors ?? [];

  if (pageErrors.length > 0) {
    return {
      errors: pageErrors.map((e) => ({
        code: e.code ?? "PAGE_UPDATE",
        message: e.message,
      })),
      ok: false,
    };
  }

  revalidatePath("/configuration/general");

  return { data: { imageUrl: fileUrl }, ok: true };
}
