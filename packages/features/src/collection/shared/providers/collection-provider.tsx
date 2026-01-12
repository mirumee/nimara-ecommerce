import { notFound } from "next/navigation";

import { type Collection } from "@nimara/domain/objects/Collection";
import { type PageInfo } from "@nimara/infrastructure/collection/types";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export interface CollectionProviderData {
  collection: Collection | null;
  pageInfo: PageInfo;
  searchParams: {
    after?: string;
    before?: string;
    limit?: string;
  };
}

export interface CollectionProviderProps {
  defaultResultsPerPage: number;
  render: (data: CollectionProviderData) => React.ReactNode;
  searchParams: {
    after?: string;
    before?: string;
    limit?: string;
  };
  services: ServiceRegistry;
  slug: string;
}

export const CollectionProvider = async ({
  render,
  slug,
  searchParams,
  services,
  defaultResultsPerPage,
}: CollectionProviderProps) => {
  const { after, before, limit } = searchParams;

  const getCollectionResult = await services.collection.getCollectionDetails({
    channel: services.region.market.channel,
    languageCode: services.region.language.code,
    slug,
    limit: limit ? Number.parseInt(limit) : defaultResultsPerPage,
    after,
    before,
    options: {
      next: {
        revalidate: services.config.cacheTTL.pdp,
        tags: [`COLLECTION:${slug}`, "DETAIL-PAGE:COLLECTION"],
      },
    },
  });

  if (!getCollectionResult.ok || !getCollectionResult.data.results) {
    return notFound();
  }

  return (
    <>
      {render({
        collection: getCollectionResult.data.results,
        pageInfo: getCollectionResult.data.pageInfo,
        searchParams,
      })}
    </>
  );
};
