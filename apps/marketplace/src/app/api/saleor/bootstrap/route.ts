import { type NextRequest, NextResponse } from "next/server";

import { getAppConfig, setAppConfig } from "@/lib/saleor/app-config";
import {
  bootstrapVendorProfileModel,
  checkVendorProfileExists,
} from "@/lib/saleor/vendor-profile-bootstrap";

/**
 * Check if vendor profile model exists.
 * GET with x-saleor-domain header returns { exists: boolean }.
 */
export async function GET(request: NextRequest) {
  const saleorDomain = request.headers.get("x-saleor-domain");

  if (!saleorDomain) {
    return NextResponse.json(
      { error: "Missing x-saleor-domain header" },
      { status: 400 },
    );
  }

  try {
    const appConfig = await getAppConfig(saleorDomain);

    if (!appConfig) {
      return NextResponse.json({ exists: false });
    }

    const apiUrl =
      (appConfig.config as { apiUrl?: string } | undefined)?.apiUrl ??
      `https://${saleorDomain}/graphql/`;

    const exists = await checkVendorProfileExists(apiUrl, appConfig.authToken);

    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json({ exists: false });
  }
}

/**
 * Manual bootstrap endpoint for vendor profile model.
 * Use when the model was deleted in Saleor and the app was reinstalled
 * (register may not be called again, or bootstrap may have failed).
 *
 * Requires: x-saleor-domain header
 */
export async function POST(request: NextRequest) {
  const saleorDomain = request.headers.get("x-saleor-domain");

  if (!saleorDomain) {
    return NextResponse.json(
      { error: "Missing x-saleor-domain header" },
      { status: 400 },
    );
  }

  try {
    const appConfig = await getAppConfig(saleorDomain);

    if (!appConfig) {
      return NextResponse.json(
        {
          error: "App not configured for this domain",
          details: "Install the app first via Saleor Cloud.",
        },
        { status: 404 },
      );
    }

    const apiUrl =
      (appConfig.config as { apiUrl?: string } | undefined)?.apiUrl ??
      `https://${saleorDomain}/graphql/`;

    const existingPageTypeId = (
      appConfig.config as { vendorProfilePageTypeId?: string }
    )?.vendorProfilePageTypeId;

    const bootstrapResult = await bootstrapVendorProfileModel(
      apiUrl,
      appConfig.authToken,
      existingPageTypeId,
    );

    if (!bootstrapResult.ok) {
      return NextResponse.json(
        {
          error: "Vendor profile bootstrap failed",
          details: bootstrapResult.error,
        },
        { status: 500 },
      );
    }

    // Update config with new page type ID if we created one
    if (bootstrapResult.pageTypeId && !bootstrapResult.skipped) {
      const existingConfig =
        (appConfig.config as Record<string, unknown>) ?? {};

      await setAppConfig(saleorDomain, {
        ...appConfig,
        config: {
          ...existingConfig,
          vendorProfilePageTypeId: bootstrapResult.pageTypeId,
        },
      });
    }

    return NextResponse.json({
      status: "ok",
      pageTypeId: bootstrapResult.pageTypeId,
      skipped: bootstrapResult.skipped,
    });
  } catch (error) {
    console.error("Bootstrap failed:", error);

    return NextResponse.json(
      {
        error: "Bootstrap failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
