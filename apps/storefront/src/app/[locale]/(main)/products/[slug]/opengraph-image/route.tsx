import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/regions/server";
import { getStoreService } from "@/services/store";

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

  const [region, storeService, t] = await Promise.all([
    getCurrentRegion(),
    getStoreService(),
    getTranslations(),
  ]);

  const { data } = await storeService.getProductDetails({
    productSlug: slug,
    customMediaFormat: "ORIGINAL",
    channel: region.market.channel,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    options: {
      next: {
        revalidate: CACHE_TTL.pdp,
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
      },
    },
  });

  if (!data?.product) {
    return new Response("Not found", { status: 404 });
  }

  if (!data.product?.images?.[0]?.url) {
    return new ImageResponse(
      (
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
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
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
            src={data.product.images[0].url}
            alt={data.product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
