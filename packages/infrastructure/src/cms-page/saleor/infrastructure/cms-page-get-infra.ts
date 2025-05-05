import { ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import { parseSaleorDataToFields } from "#root/lib/serializers/cms-page";
import type { CMSPageGetInfra } from "#root/use-cases/cms-page/types";

import type { SaleorCMSPageServiceConfig } from "../../types";
import { PageDocument } from "../graphql/queries/generated";

export const saleorCMSPageGetInfra =
  ({ apiURL, logger }: SaleorCMSPageServiceConfig): CMSPageGetInfra =>
  async ({ languageCode, slug, options }) => {
    const result = await graphqlClient(apiURL).execute(PageDocument, {
      options,
      variables: {
        languageCode,
        slug,
      },
      operationName: "PageQuery",
    });

    if (!result.ok) {
      logger.error(`Error fetching CMS page from Saleor`, {
        error: result.errors,
        variables: {
          languageCode,
          slug,
        },
      });

      return result;
    }

    if (!result.data.page) {
      logger.error(`No data returned from Saleor CMS page query`, {
        variables: {
          languageCode,
          slug,
        },
      });

      return ok(null);
    }

    return ok({
      title: result.data.page.title,
      content: result.data.page.content,
      fields: parseSaleorDataToFields(result.data.page.attributes),
    });
  };
