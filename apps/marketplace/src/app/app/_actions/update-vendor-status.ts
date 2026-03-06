"use server";

import { config } from "@/lib/config";
import { sendVendorAcceptedEmail, sendVendorRejectedEmail } from "@/lib/email";
import { getAppConfig } from "@/lib/saleor/app-config";
import { type VendorProfile, vendorsService } from "@/services/vendors";

function getVendorSignInUrl(): string {
  return `${config.urls.vendor}/sign-in`;
}

function getAttributeValue(
  profile: VendorProfile,
  slug: string,
): string | null {
  const attr = profile.assignedAttributes?.find(
    (a) => a.attribute?.slug === slug,
  );

  if (!attr) {
    return null;
  }

  if (attr.plainTextValue != null) {
    return attr.plainTextValue;
  }

  return attr.choiceValue?.name ?? null;
}

function getAttributeId(profile: VendorProfile, slug: string): string | null {
  const attr = profile.assignedAttributes?.find(
    (a) => a.attribute?.slug === slug,
  );

  return attr?.attribute?.id ?? null;
}

async function getVendorCustomerEmail(
  vendorPageId: string,
): Promise<string | null> {
  const saleorUrl = process.env.NEXT_PUBLIC_SALEOR_URL;

  if (!saleorUrl) {
    console.warn(
      "[update-vendor-status] NEXT_PUBLIC_SALEOR_URL is not set, cannot resolve customer email.",
    );

    return null;
  }

  const saleorDomain = new URL(saleorUrl).hostname;

  let appConfig: Awaited<ReturnType<typeof getAppConfig>>;

  try {
    appConfig = await getAppConfig(saleorDomain);
  } catch (error) {
    console.error(
      "[update-vendor-status] Failed to load app config when resolving vendor customer email",
      error,
    );

    return null;
  }

  if (!appConfig?.authToken) {
    console.warn(
      "[update-vendor-status] App auth token missing, cannot query Saleor customers.",
    );

    return null;
  }

  const apiUrl =
    typeof (appConfig.config as any)?.apiUrl === "string"
      ? String((appConfig.config as any).apiUrl)
      : `https://${saleorDomain}/graphql/`;

  const query = `
    query CustomersByVendorId($key: String!, $value: String!) {
      customers(
        first: 1
        filter: { metadata: { key: $key, value: $value } }
      ) {
        edges {
          node {
            email
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${appConfig.authToken}`,
      },
      body: JSON.stringify({
        query,
        variables: { key: "vendor.id", value: vendorPageId },
      }),
    });

    if (!res.ok) {
      console.error(
        "[update-vendor-status] Saleor customers query failed",
        res.status,
        res.statusText,
      );

      return null;
    }

    const body = (await res.json()) as {
      data?: {
        customers?: {
          edges?: Array<{ node?: { email?: string | null } }>;
        } | null;
      };
    };

    const email = body.data?.customers?.edges?.[0]?.node?.email ?? null;

    return email && email.length > 0 ? email : null;
  } catch (error) {
    console.error(
      "[update-vendor-status] Error querying Saleor customers for vendor email",
      error,
    );

    return null;
  }
}

export async function updateVendorStatusAndNotify(params: {
  newStatus: string;
  vendor: VendorProfile;
}) {
  const { vendor, newStatus } = params;

  const attributeId = getAttributeId(vendor, "vendor-status");

  if (!attributeId) {
    return { ok: false, error: "Missing vendor-status attribute" };
  }

  const result = await vendorsService.updateVendorStatus(
    vendor.id,
    attributeId,
    newStatus,
    null,
  );

  if (!result.ok || result.data.pageUpdate.errors.length > 0) {
    return {
      error: "Failed to update vendor status",
      ok: false,
    };
  }

  const contactEmail = await getVendorCustomerEmail(vendor.id);

  if (!contactEmail) {
    return { ok: true };
  }

  const vendorName =
    getAttributeValue(vendor, "vendor-name") ?? vendor.title ?? "";
  const companyName =
    getAttributeValue(vendor, "company-name") ?? vendorName ?? "";

  try {
    if (newStatus.toLowerCase() === "active") {
      await sendVendorAcceptedEmail({
        vendorName,
        companyName,
        contactEmail,
        signInUrl: getVendorSignInUrl(),
      });
    } else if (newStatus.toLowerCase() === "rejected") {
      await sendVendorRejectedEmail({
        vendorName,
        companyName,
        contactEmail,
        superadminEmail: config.email.superadminEmail ?? undefined,
      });
    }
  } catch (error) {
    console.error(
      "[update-vendor-status] Vendor status updated, but notification email failed",
      error,
    );
  }

  return { ok: true };
}
