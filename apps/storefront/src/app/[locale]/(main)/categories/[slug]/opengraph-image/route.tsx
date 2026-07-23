import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/foundation/regions";
import { getServiceRegistry } from "@/services/registry";

const size = {
  width: 1200,
  height: 630,
};

export const runtime = "edge";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  const [services, region, t] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
    getTranslations(),
  ]);
  const categoryService = await services.getCategoryService();

  const getCategoryResult = await categoryService.getCategoryDetails({
    slug,
    languageCode: region.language.code,
    options: {
      next: {
        revalidate: CACHE_TTL.pdp,
        tags: [`CATEGORY:${slug}`, "DETAIL-PAGE:CATEGORY"],
      },
    },
  });

  const category = getCategoryResult.data;

  if (!category) {
    return new Response("Not found", { status: 404 });
  }

  if (!category.backgroundImage?.url) {
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={new URL(
            "og-hp.png",
            clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
          ).toString()}
          alt={t("common.logo")}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </div>,
      { ...size },
    );
  }

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <div
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={new URL(
            "brand-logo-dark.svg",
            clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
          ).toString()}
          alt={t("common.logo")}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </div>
      <div
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={category.backgroundImage.url}
          alt={category.backgroundImage.alt || t("categories.category-image")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>,
    { ...size },
  );
}
