import { ImageResponse } from "next/og";

import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/regions/server";
import { storeService } from "@/services";

export const size = {
  width: 1200,
  height: 630,
};

export const runtime = "edge";

export const contentType = "image/png";
export const alt = "Product preview";

// eslint-disable-next-line import/no-default-export
export default async function Image({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const region = await getCurrentRegion();

  const serviceOpts = {
    channel: region.market.channel,
    languageCode: region.language.code,
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    countryCode: region.market.countryCode,
  };

  const { data } = await storeService(serviceOpts).getProductDetails({
    productSlug: slug,
    customMediaFormat: "ORIGINAL",
    options: {
      next: {
        revalidate: CACHE_TTL.pdp,
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
      },
    },
  });

  if (!data?.product) {
    return null;
  }

  return new ImageResponse(
    (
      <div tw="flex w-full h-full items-center justify-center bg-neutral-100">
        <div style={{ display: "flex" }}>
          <div
            style={{
              backgroundImage: `url(${data?.product?.images[0]?.url})`,
              height: "630px",
              width: "630px",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "contain",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
