import { ArrowRight } from "lucide-react";

import type { Attribute } from "@nimara/domain/objects/Attribute";
import type { SearchContext } from "@nimara/infrastructure/use-cases/search/types";
import { Button } from "@nimara/ui/components/button";

import { Link } from "@/i18n/routing";
import { getAttributes } from "@/lib/helpers";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { searchService } from "@/services/search";

const attributeSlugs = [
  "homepage-banner-header",
  "homepage-banner-image",
  "homepage-banner-button-text",
];

export const HeroBanner = async ({
  attributes,
}: {
  attributes: Attribute[] | undefined;
}) => {
  const region = await getCurrentRegion();

  const searchContext = {
    currency: region.market.currency,
    channel: region.market.channel,
    languageCode: region.language.code,
  } satisfies SearchContext;

  if (attributes?.length === 0) {
    return null;
  }

  const attributesMap = getAttributes(attributes, attributeSlugs);

  const header = attributesMap["homepage-banner-header"];
  const buttonText = attributesMap["homepage-banner-button-text"];
  const image = attributesMap["homepage-banner-image"];

  const productId = image?.values[0]?.reference as string;

  const { results: products } = await searchService.search(
    {
      productIds: [productId],
      limit: 1,
    },
    searchContext,
  );

  return (
    <div className="mb-14 flex flex-col items-center bg-stone-100 sm:h-[27rem] sm:flex-row">
      <div className="order-last p-8 sm:order-first sm:basis-1/2 lg:p-16">
        <h1 className="pb-8 text-3xl font-medium lg:text-5xl">
          {header?.values[0]?.plainText}
        </h1>
        <Button asChild>
          <Link href={paths.search.asPath()}>
            {buttonText?.values[0]?.plainText}
            <ArrowRight className="h-4 w-5 pl-1" />
          </Link>
        </Button>
      </div>
      <div className="sm-order-last order-first w-full sm:basis-1/2">
        <div
          className="h-[22rem] bg-cover bg-center sm:h-[27rem]"
          style={{ backgroundImage: `url(${products[0]?.thumbnail?.url})` }}
        />
      </div>
    </div>
  );
};
