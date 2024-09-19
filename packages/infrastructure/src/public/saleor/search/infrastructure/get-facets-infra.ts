import type { LanguageCodeEnum } from "@nimara/codegen/schema";

import { graphqlClient } from "#root/graphql/client";
import type { FacetType, GetFacetsInfra } from "#root/use-cases/search/types";

import { FacetsQueryDocument } from "../graphql/queries/generated";
import type { SaleorSearchServiceConfig } from "../types";

export const saleorGetFacetsInfra =
  ({ apiURL }: SaleorSearchServiceConfig): GetFacetsInfra =>
  async (_params, context) => {
    const { data } = await graphqlClient(apiURL).execute(FacetsQueryDocument, {
      variables: {
        channel: context.channel,
        languageCode: context.languageCode as LanguageCodeEnum,
      },
      options: {
        next: {
          // FIXME: Temp value for now
          revalidate: 5 * 60,
          tags: ["SEARCH", "SEARCH:FACETS"],
        },
      },
    });

    if (!data?.attributes?.edges.length) {
      return { facets: [] };
    }

    return {
      facets: data.attributes.edges.map(({ node: attribute }) => ({
        name: attribute.translation?.name ?? attribute.name ?? "",
        slug: attribute.slug!,
        choices:
          attribute.choices?.edges.map(({ node: choice }) => ({
            label: choice.name ?? "",
            value: choice.slug ?? "",
          })) ?? [],
        type: String(attribute.inputType) as FacetType,
      })),
    };
  };
