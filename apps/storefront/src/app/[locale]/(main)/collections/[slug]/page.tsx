import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { RichText } from "@nimara/ui/components/rich-text/rich-text";
import { editorJSDataToString } from "@nimara/ui/lib/richText";

import { CACHE_TTL, DEFAULT_RESULTS_PER_PAGE } from "@/config";
import { clientEnvs } from "@/envs/client";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { collectionService } from "@/services/collection";

import { Breadcrumbs } from "../../_components/breadcrumbs";
import { ProductsList } from "../../_components/products-list";
import { SearchPagination } from "../../_components/search-pagination";

type PageProps = {
  params: Promise<{
    locale: SupportedLocale;
    slug: string;
  }>;
  searchParams: Promise<{
    after?: string;
    before?: string;
    limit?: string;
  }>;
};

export async function generateMetadata(props: PageProps) {
  const params = props.params;

  const { slug } = await params;
  const url = new URL(
    paths.collections.asPath({ slug }),
    clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
  );
  const canonicalUrl = url.toString();
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
  const rawDescription = collection?.description;
  const parsedDescription = editorJSDataToString(rawDescription)?.trim();

  return {
    title: collection?.seoTitle || collection?.name,
    description:
      collection?.seoDescription || parsedDescription.length
        ? parsedDescription.slice(0, 200)
        : collection?.name,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function Page(props: PageProps) {
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
      <Breadcrumbs pageName={collection.name} />
      <div className="grid basis-full items-center justify-center gap-4 md:flex">
        <h1 className="text-primary text-center text-2xl">
          {collection?.name}
        </h1>
      </div>
      <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl">
        {collection?.thumbnail ? (
          <Image
            src={collection.thumbnail.url}
            alt={collection.thumbnail.alt || collection.name}
            fill
            sizes="(max-width: 960px) 100vw, 50vw"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="grid min-w-full items-start gap-8 md:flex">
        <RichText contentData={collection?.description} />
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
