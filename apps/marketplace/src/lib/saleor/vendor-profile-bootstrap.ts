/**
 * Bootstrap Vendor Profile Model (Saleor Model / Page Type) on app installation.
 *
 * Creates a "Vendor Profile" page type with attributes for vendor branding:
 * - background_image (FILE)
 * - logo (FILE)
 * - description (RICH_TEXT)
 * - social_links (PLAIN_TEXT) - optional, JSON or structured
 * - return_policy_url (PLAIN_TEXT) - optional
 *
 * Page type slug: "vendor-profile" (static, no random UUID).
 * vendor.id: UUID v4 via generateVendorId() (safe, unique).
 *
 * Vendor identification model:
 * - vendor.id = UUID (canonical vendor identifier)
 * - User metadata vendor.id = UUID (links customer account to vendor profile)
 * - Page ID (vendor profile page) identifies the vendor in the model
 * - Page represents a registered vendor; User represents the customer account
 *
 * @see https://docs.saleor.io/developer/models
 */

import { METADATA_KEYS } from "./consts";

/** Generate a safe, unique vendor ID (UUID v4) */
export function generateVendorId(): string {
  return crypto.randomUUID();
}

const ATTRIBUTE_CREATE_MUTATION = `
  mutation AttributeCreate($input: AttributeCreateInput!) {
    attributeCreate(input: $input) {
      attribute {
        id
        slug
      }
      errors {
        code
        message
        field
      }
    }
  }
`;

const ATTRIBUTE_QUERY = `
  query Attribute($slug: String!) {
    attribute(slug: $slug) {
      id
    }
  }
`;

const PAGE_TYPE_QUERY = `
  query PageType($id: ID!) {
    pageType(id: $id) {
      id
    }
  }
`;

const PAGE_TYPES_BY_SLUG_QUERY = `
  query PageTypesBySlug($filter: PageTypeFilterInput) {
    pageTypes(filter: $filter, first: 1) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

const PAGE_TYPE_CREATE_MUTATION = `
  mutation PageTypeCreate($input: PageTypeCreateInput!) {
    pageTypeCreate(input: $input) {
      pageType {
        id
        slug
      }
      errors {
        code
        message
        field
      }
    }
  }
`;

type AttributeValueInput = {
  name: string;
  value?: string;
};

type AttributeInput = {
  entityType: string;
  inputType: string;
  name: string;
  slug: string;
  type: string;
  valueRequired?: boolean;
  values?: AttributeValueInput[];
};

/** Metadata key for User metadata: value = Vendor ID (UUID) */
export const VENDOR_ID_METADATA_KEY = METADATA_KEYS.VENDOR_ID;

const VENDOR_PROFILE_ATTRIBUTES: AttributeInput[] = [
  {
    entityType: "PAGE",
    inputType: "PLAIN_TEXT",
    name: "Vendor name",
    slug: "vendor-name",
    type: "PAGE_TYPE",
    valueRequired: true,
  },
  {
    entityType: "PAGE",
    inputType: "PLAIN_TEXT",
    name: "Company name",
    slug: "company-name",
    type: "PAGE_TYPE",
    valueRequired: false,
  },
  {
    entityType: "PAGE",
    inputType: "PLAIN_TEXT",
    name: "VAT ID",
    slug: "vat-id",
    type: "PAGE_TYPE",
    valueRequired: true,
  },
  {
    entityType: "PAGE",
    inputType: "DROPDOWN",
    name: "Vendor Status",
    slug: "vendor-status",
    type: "PAGE_TYPE",
    valueRequired: true,
    values: [{ name: "pending" }, { name: "active" }, { name: "rejected" }],
  },
  {
    entityType: "PAGE",
    inputType: "FILE",
    name: "Background image",
    slug: "background-image",
    type: "PAGE_TYPE",
    valueRequired: false,
  },
  {
    entityType: "PAGE",
    inputType: "FILE",
    name: "Logo",
    slug: "logo",
    type: "PAGE_TYPE",
    valueRequired: false,
  },
  {
    entityType: "PAGE",
    inputType: "RICH_TEXT",
    name: "Description",
    slug: "description",
    type: "PAGE_TYPE",
    valueRequired: false,
  },
];

async function saleorFetch<T>(
  apiUrl: string,
  authToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ data?: T; errors?: Array<{ code?: string; message: string }> }> {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = (await res.json()) as {
    data?: T;
    errors?: Array<{ code?: string; message: string }>;
  };

  if (!res.ok) {
    throw new Error(
      `Saleor API error ${res.status}: ${body.errors?.[0]?.message ?? res.statusText}`,
    );
  }

  return body;
}

/**
 * Check if the vendor profile page type exists in Saleor.
 */
export async function checkVendorProfileExists(
  apiUrl: string,
  authToken: string,
): Promise<boolean> {
  const res = await saleorFetch<{
    pageTypes?: {
      edges?: Array<{ node?: { id: string } }>;
    } | null;
  }>(apiUrl, authToken, PAGE_TYPES_BY_SLUG_QUERY, {
    filter: { slugs: ["vendor-profile"] },
  });

  return !!res.data?.pageTypes?.edges?.[0]?.node?.id;
}

/**
 * Bootstrap the Vendor Profile model type and attributes in Saleor.
 * Idempotent: uses existing page type from config if it still exists in Saleor;
 * otherwise creates a new one. Handles the case where the page type was
 * manually deleted but config still holds the old ID.
 *
 * @param apiUrl - Saleor GraphQL endpoint (e.g. https://xxx.saleor.cloud/graphql/)
 * @param authToken - App JWT token
 * @param existingPageTypeId - If set and exists in Saleor, skip creation; otherwise create
 */
export async function bootstrapVendorProfileModel(
  apiUrl: string,
  authToken: string,
  existingPageTypeId?: string | null,
): Promise<{
  error?: string;
  ok: boolean;
  pageTypeId?: string;
  skipped?: boolean;
}> {
  try {
    if (existingPageTypeId) {
      const checkRes = await saleorFetch<{
        pageType?: { id: string } | null;
      }>(apiUrl, authToken, PAGE_TYPE_QUERY, { id: existingPageTypeId });

      if (checkRes.data?.pageType?.id) {
        return { ok: true, pageTypeId: existingPageTypeId, skipped: true };
      }

      // Page type was deleted (manually or by teardown); proceed to create
    }

    // Check if vendor-profile page type exists by slug (e.g. after manual deletion, slug may still exist)
    const bySlugRes = await saleorFetch<{
      pageTypes?: {
        edges?: Array<{ node?: { id: string } }>;
      } | null;
    }>(apiUrl, authToken, PAGE_TYPES_BY_SLUG_QUERY, {
      filter: { slugs: ["vendor-profile"] },
    });

    const existingBySlug = bySlugRes.data?.pageTypes?.edges?.[0]?.node?.id;

    if (existingBySlug) {
      return { ok: true, pageTypeId: existingBySlug, skipped: true };
    }

    // Create attributes
    const attributeIds: string[] = [];

    for (const attr of VENDOR_PROFILE_ATTRIBUTES) {
      const createRes = await saleorFetch<{
        attributeCreate: {
          attribute?: { id: string };
          errors?: Array<{ code?: string; message: string }>;
        };
      }>(apiUrl, authToken, ATTRIBUTE_CREATE_MUTATION, {
        input: attr,
      });

      const attrCreate = createRes.data?.attributeCreate;

      const errors = attrCreate?.errors ?? createRes.errors;

      if (errors?.length) {
        // Attribute might already exist (slug conflict) - fetch existing and add to page type
        const isSlugConflict = errors.some(
          (e) =>
            e.code === "UNIQUE" ||
            e.message?.toLowerCase().includes("unique") ||
            e.message?.toLowerCase().includes("already exists"),
        );

        if (!isSlugConflict) {
          return {
            error: `Attribute ${attr.slug}: ${errors.map((e) => e.message).join(", ")}`,
            ok: false,
          };
        }

        const existingRes = await saleorFetch<{
          attribute?: { id: string } | null;
        }>(apiUrl, authToken, ATTRIBUTE_QUERY, { slug: attr.slug });

        if (existingRes.data?.attribute?.id) {
          attributeIds.push(existingRes.data.attribute.id);
        }

        continue;
      }

      if (attrCreate?.attribute?.id) {
        attributeIds.push(attrCreate.attribute.id);
      }
    }

    if (attributeIds.length === 0) {
      return {
        error: "Could not create any attributes for Vendor Profile",
        ok: false,
      };
    }

    // Create page type with attributes
    const pageTypeRes = await saleorFetch<{
      pageTypeCreate: {
        errors?: Array<{ code?: string; message: string }>;
        pageType?: { id: string };
      };
    }>(apiUrl, authToken, PAGE_TYPE_CREATE_MUTATION, {
      input: {
        addAttributes: attributeIds,
        name: "Vendor Profile",
        slug: "vendor-profile",
      },
    });

    const pageTypeCreate = pageTypeRes.data?.pageTypeCreate;
    const pageTypeErrors = pageTypeCreate?.errors ?? pageTypeRes.errors;

    if (pageTypeErrors?.length) {
      return {
        error: `Page type create: ${pageTypeErrors.map((e) => e.message).join(", ")}`,
        ok: false,
      };
    }

    const pageTypeId = pageTypeCreate?.pageType?.id;

    return { ok: true, pageTypeId };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown bootstrap error";

    return { error: message, ok: false };
  }
}
