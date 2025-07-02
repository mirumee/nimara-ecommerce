import { ImageResponse } from "next/og";

import { CACHE_TTL, DEFAULT_RESULTS_PER_PAGE } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/regions/server";
import { collectionService } from "@/services/collection";

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

  const getCollectionResult = await collectionService.getCollectionDetails({
    channel: region.market.channel,
    languageCode: region.language.code,
    slug,
    limit: DEFAULT_RESULTS_PER_PAGE,
    options: {
      next: {
        revalidate: CACHE_TTL.pdp,
        tags: [`COLLECTION:${slug}`, "DETAIL-PAGE:COLLECTION"],
      },
    },
  });

  const collection = getCollectionResult.data?.results;

  if (!collection) {
    return null;
  }

  if (!collection?.thumbnail?.url) {
    return new ImageResponse(
      (
        <div
          tw="flex w-full h-full"
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
            alt="Nimara's logo"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      ),
    );
  }

  return new ImageResponse(
    (
      <div
        tw="flex w-full h-full"
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            width: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={new URL(
              "brand-logo-dark.svg",
              clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
            ).toString()}
            alt="Nimara's logo"
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
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={collection.thumbnail.url}
            alt={collection.thumbnail.alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
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
