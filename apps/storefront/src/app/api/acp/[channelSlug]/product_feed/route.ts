import { NextResponse } from "next/server";

import { saleorAcPService } from "@nimara/infrastructure/mcp/saleor/service";

import { clientEnvs } from "@/envs/client";
import { MARKETS } from "@/regions/config";
import { storefrontLogger } from "@/services/logging";
// TODO: Extend the ProductFeedItem type based on required fields from MCP docs

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ channelSlug: string }> },
) {
  const { channelSlug } = await params;

  const marketData = Object.values(MARKETS).find(
    (market) => market.channel === channelSlug,
  );

  if (!marketData) {
    storefrontLogger.error(`Invalid channel slug: ${channelSlug}`);

    return NextResponse.json(
      { status: "Invalid channel slug" },
      { status: 400 },
    );
  }
  const acpService = saleorAcPService({
    apiUrl: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
    channel: channelSlug,
  });

  const productFeedResult = await acpService.getProductFeed({
    channel: channelSlug,
    limit: 100,
  });

  if (!productFeedResult.ok) {
    storefrontLogger.error(
      `Failed to fetch product feed for channel ${channelSlug}: ${productFeedResult.errors.join(
        ", ",
      )}`,
    );

    return NextResponse.json(
      { status: "Failed to fetch product feed" },
      { status: 500 },
    );
  }

  if (productFeedResult.data.products.length > 0) {
    // If the MCP service returns products, use them directly
    return NextResponse.json({ products: productFeedResult.data.products });
  }
  // const searchService = await getSearchService();

  // // TODO: Add pagination handling to fetch all products if there are more than the limit
  // // TODO: Implement a new method in the search service to fetch all products with pagination
  // // For now, we use a search with an empty query to get products
  // const result = await searchService.search(
  //   {
  //     query: "",
  //     limit: 100,
  //   },
  //   {
  //     channel: channelSlug,
  //     currency: marketData.currency,
  //     languageCode: marketData.defaultLanguage.code,
  //   },
  // );

  // if (!result.ok) {
  //   storefrontLogger.error(
  //     `Failed to fetch products for channel ${channelSlug}: ${result.errors.join(", ")}`,
  //   );

  //   return NextResponse.json(
  //     { status: "Failed to fetch products" },
  //     { status: 500 },
  //   );
  // }

  // // TODO: Type the products properly based on the actual product structure
  // const products: Array<ProductFeedItem> = [];

  // for (const product of result.data.results) {
  //   // TODO: Adjust fields based on actual product structure,
  //   // might require adding a new method in the search service for more complete data
  //   products.push({ id: product.id });
  // }

  // return NextResponse.json({ products });
}
