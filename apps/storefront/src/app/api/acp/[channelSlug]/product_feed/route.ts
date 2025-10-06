import { NextResponse } from "next/server";

import { MARKETS } from "@/regions/config";
import { storefrontLogger } from "@/services/logging";
import { getSearchService } from "@/services/search";

// TODO: Extend the ProductFeedItem type based on required fields from MCP docs
type ProductFeedItem = {
  id: string;
};

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

  const searchService = await getSearchService();

  // TODO: Add pagination handling to fetch all products if there are more than the limit
  // TODO: Implement a new method in the search service to fetch all products with pagination
  // For now, we use a search with an empty query to get products
  const result = await searchService.search(
    {
      query: "",
      limit: 100,
    },
    {
      channel: channelSlug,
      currency: marketData.currency,
      languageCode: marketData.defaultLanguage.code,
    },
  );

  if (!result.ok) {
    storefrontLogger.error(
      `Failed to fetch products for channel ${channelSlug}: ${result.errors.join(", ")}`,
    );

    return NextResponse.json(
      { status: "Failed to fetch products" },
      { status: 500 },
    );
  }

  // TODO: Type the products properly based on the actual product structure
  const products: Array<ProductFeedItem> = [];

  for (const product of result.data.results) {
    // TODO: Adjust fields based on actual product structure,
    // might require adding a new method in the search service for more complete data
    products.push({ id: product.id });
  }

  return NextResponse.json({ products });
}
