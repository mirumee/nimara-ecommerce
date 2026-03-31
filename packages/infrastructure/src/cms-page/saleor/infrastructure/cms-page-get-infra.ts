import { type LanguageCodeEnum } from "@nimara/codegen/schema";
import { ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import { parseSaleorDataToFields } from "#root/lib/serializers/cms-page";
import type { CMSPageGetInfra } from "#root/use-cases/cms-page/types";

import type { SaleorCMSPageServiceConfig } from "../../types";
import {
  type Page_page_Page,
  PageDocument,
} from "../graphql/queries/generated";

function saleorPageToCMSFields(page: Page_page_Page) {
  return {
    id: page.id,
    pageTypeSlug: page.pageType?.slug ?? null,
    title: page.title,
    content: page.content,
    fields: parseSaleorDataToFields(page.attributes),
  };
}

export const saleorCMSPageGetInfra =
  ({ apiURL, logger }: SaleorCMSPageServiceConfig): CMSPageGetInfra =>
  async ({ languageCode, slug, options, accessToken }) => {
    const fetchOptions = accessToken?.trim()
      ? { ...options, next: undefined, cache: "no-store" as const }
      : options;

    const result = await graphqlClient(apiURL, accessToken).execute(
      PageDocument,
      {
        options: fetchOptions,
        variables: {
          languageCode: languageCode as LanguageCodeEnum,
          slug,
        },
        operationName: "PageQuery",
      },
    );

    if (!result.ok) {
      logger.error(`Error fetching CMS page from Saleor`, {
        error: result.errors,
        variables: { languageCode, slug },
      });

      return result;
    }

    if (!result.data.page) {
      logger.error(`No data returned from Saleor CMS page query`, {
        variables: { languageCode, slug },
      });

      return ok(null);
    }

    return ok(saleorPageToCMSFields(result.data.page));
  };
