import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { RichText } from "@nimara/ui/components/rich-text";

import { CACHE_TTL, DEFAULT_RESULTS_PER_PAGE } from "@/config";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { collectionService } from "@/services";

import { ProductsList } from "../../../(main)/_components/products-list";
import { SearchPagination } from "../../../(main)/_components/search-pagination";

type SearchParams = Promise<{
  after?: string;
  before?: string;
  limit?: string;
}>;

type Params = Promise<{
  locale: string;
  slug: string;
}>;

export async function generateMetadata(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const params = props.params;

  const { after, before, limit } = searchParams;
  const { slug } = await params;
  const region = await getCurrentRegion();

  const getCollectionResult = await collectionService.getCollectionDetails({
    channel: region.market.channel,
    languageCode: region.language.code,
    slug,
    limit: limit ? Number.parseInt(limit) : DEFAULT_RESULTS_PER_PAGE,
    after,
    before,
    options: {
      next: {
        revalidate: CACHE_TTL.pdp,
        tags: [`COLLECTION:${slug}`, "DETAIL-PAGE:COLLECTION"],
      },
    },
  });

  const collection = getCollectionResult.data?.results;

  return {
    title: collection?.seoTitle || collection?.name,
    description: collection?.seoDescription || collection?.description,
  };
}

export default async function Page(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const params = props.params;

  const { after, before, limit } = searchParams;
  const { slug } = await params;
  const region = await getCurrentRegion();

  const [getCollectionResult, t] = await Promise.all([
    collectionService.getCollectionDetails({
      channel: region.market.channel,
      languageCode: region.language.code,
      slug,
      limit: limit ? Number.parseInt(limit) : DEFAULT_RESULTS_PER_PAGE,
      after,
      before,
      options: {
        next: {
          revalidate: CACHE_TTL.pdp,
          tags: [`COLLECTION:${slug}`, "DETAIL-PAGE:COLLECTION"],
        },
      },
    }),
    getTranslations("collections"),
  ]);

  if (!getCollectionResult.ok || !getCollectionResult.data.results) {
    notFound();
  }

  const collection = getCollectionResult.data.results;
  const pageInfo = getCollectionResult.data.pageInfo;

  return (
    <div className="mb-8 grid w-full gap-8">
      <div className="grid basis-full items-center justify-center gap-4 md:flex">
        <h1 className="text-center text-2xl text-primary">
          {collection?.name}
        </h1>
      </div>
      <div className="relative mx-auto w-full max-w-md overflow-hidden">
        {collection?.thumbnail ? (
          <Image
            src={collection.thumbnail.url}
            alt={collection.thumbnail.alt || collection.name}
            height={500}
            width={500}
            sizes="(max-width: 960px) 100vw, 50vw"
            className="h-auto w-full object-cover"
          />
        ) : null}
      </div>

      <div className="grid min-w-full items-start gap-8 md:flex">
        <div className="basis-10/12">
          <RichText jsonStringData={collection?.description} />
        </div>
      </div>

      <hr />

      <h2 className="text-2xl">{t("associated-products")}</h2>

      <ProductsList products={collection.products} />
      {pageInfo && (
        <SearchPagination
          pageInfo={pageInfo}
          searchParams={searchParams}
          baseUrl={paths.collections.asPath({ slug })}
        />
      )}
    </div>
  );
}
