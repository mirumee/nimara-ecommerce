import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService, productsService } from "@/services";

import { NewProductClient } from "./_components/new-product-client";

export default async function NewProductPage() {
  const token = await getServerAuthToken();

  const [
    channelsResult,
    categoriesResult,
    collectionsResult,
    productTypesResult,
  ] = await Promise.all([
    configurationService.getChannels(token),
    productsService.getCategories({ first: 100 }, token),
    productsService.getCollections({ first: 100 }, token),
    productsService.getProductTypes({ first: 100 }, token),
  ]);

  const channels = channelsResult.ok
    ? (channelsResult.data.channels ?? [])
    : [];
  const categories =
    categoriesResult.ok && categoriesResult.data.categories?.edges
      ? categoriesResult.data.categories.edges.map((e) => e.node)
      : [];
  const collections =
    collectionsResult.ok && collectionsResult.data.collections?.edges
      ? collectionsResult.data.collections.edges.map((e) => e.node)
      : [];
  const productTypes =
    productTypesResult.ok && productTypesResult.data.productTypes?.edges
      ? productTypesResult.data.productTypes.edges.map((e) => e.node)
      : [];

  return (
    <div className="[view-transition-name:main-content]">
      <NewProductClient
        channels={channels}
        categories={categories}
        collections={collections}
        productTypes={productTypes}
      />
    </div>
  );
}
