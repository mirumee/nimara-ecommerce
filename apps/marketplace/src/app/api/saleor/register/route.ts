import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAppConfig, setAppConfig } from "@/lib/saleor/app-config";
import { APP_CONFIG } from "@/lib/saleor/consts";
import { bootstrapVendorProfileModel } from "@/lib/saleor/vendor-profile-bootstrap";

const registerBodySchema = z.object({
  auth_token: z.string(),
});

const saleorHeadersSchema = z.object({
  "saleor-domain": z.string(),
  "saleor-api-url": z.string().url(),
});

/**
 * Check if domain is allowed
 */
function isDomainAllowed(domain: string, allowedDomains: string[]): boolean {
  if (allowedDomains.length === 0) {
    // If no domains are configured, allow all (development mode)
    return true;
  }

  return allowedDomains.some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`),
  );
}

/**
 * Fetch app ID from Saleor
 */
async function fetchAppId(
  saleorDomain: string,
  authToken: string,
): Promise<string | null> {
  const query = `
    query AppId {
      app {
        id
      }
    }
  `;

  try {
    const response = await fetch(`https://${saleorDomain}/graphql/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    return data?.data?.app?.id || null;
  } catch (error) {
    console.error("Failed to fetch app ID:", error);

    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate headers
    const headersObj = {
      "saleor-domain": request.headers.get("saleor-domain"),
      "saleor-api-url": request.headers.get("saleor-api-url"),
    };

    const headersParsed = saleorHeadersSchema.safeParse(headersObj);

    if (!headersParsed.success) {
      return NextResponse.json(
        { error: "Invalid headers", details: headersParsed.error.flatten() },
        { status: 400 },
      );
    }

    const { "saleor-domain": saleorDomain, "saleor-api-url": saleorApiUrl } =
      headersParsed.data;

    // Parse and validate body
    const body = await request.json();
    const bodyParsed = registerBodySchema.safeParse(body);

    if (!bodyParsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: bodyParsed.error.flatten() },
        { status: 400 },
      );
    }

    const { auth_token: authToken } = bodyParsed.data;

    // Check if domain is allowed
    if (!isDomainAllowed(saleorDomain, APP_CONFIG.ALLOWED_DOMAINS)) {
      return NextResponse.json(
        { error: `Domain ${saleorDomain} is not allowed` },
        { status: 403 },
      );
    }

    // Fetch app ID from Saleor
    const appId = await fetchAppId(saleorDomain, authToken);

    if (!appId) {
      console.warn("Could not fetch app ID, registration may be incomplete");
    }

    // Get existing config (for vendor profile page type ID if re-registering)
    const existingConfig = await getAppConfig(saleorDomain);

    const existingPageTypeId = existingConfig?.config
      ? (existingConfig.config as { vendorProfilePageTypeId?: string })
          .vendorProfilePageTypeId
      : undefined;

    // Bootstrap Vendor Profile model – generates unique slug/ID during installation
    const bootstrapResult = await bootstrapVendorProfileModel(
      saleorApiUrl,
      authToken,
      existingPageTypeId,
    );

    const vendorProfilePageTypeId =
      bootstrapResult.pageTypeId ?? existingPageTypeId;

    if (!bootstrapResult.ok) {
      console.error(
        `Vendor profile bootstrap failed for ${saleorDomain}:`,
        bootstrapResult.error,
      );

      return NextResponse.json(
        {
          error: "Vendor profile bootstrap failed",
          details: bootstrapResult.error,
        },
        { status: 500 },
      );
    } else if (bootstrapResult.skipped) {
      console.log(`Vendor profile model already exists for ${saleorDomain}`);
    } else {
      console.log(
        `Vendor profile model created for ${saleorDomain} (pageTypeId: ${vendorProfilePageTypeId})`,
      );
    }

    // Store app configuration (including generated vendor profile page type ID)
    await setAppConfig(saleorDomain, {
      authToken,
      saleorAppId: appId || "",
      saleorDomain,
      config: {
        apiUrl: saleorApiUrl,
        registeredAt: new Date().toISOString(),
        ...(vendorProfilePageTypeId && {
          vendorProfilePageTypeId,
        }),
      },
    });

    console.log(`App registered for domain: ${saleorDomain}`);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Registration failed:", error);

    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
