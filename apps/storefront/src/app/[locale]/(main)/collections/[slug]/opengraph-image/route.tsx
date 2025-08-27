import { ImageResponse } from "next/og";

import { CACHE_TTL, DEFAULT_RESULTS_PER_PAGE } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/regions/server";
import { getCollectionService } from "@/services/collection";

const size = {
  width: 1200,
  height: 630,
};

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const slug = (await params).slug;

  const [region, collectionService] = await Promise.all([
    getCurrentRegion(),
    getCollectionService(),
  ]);

  const getCollectionResult = await collectionService.getCollectionDetails({
    channel: region.market.channel,
    customMediaFormat: "WEBP",
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
    return new Response(null, { status: 404 });
  }

  if (!collection.thumbnail?.url) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
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
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={collection.thumbnail.url}
            alt={collection.thumbnail.alt || "Collection image"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
