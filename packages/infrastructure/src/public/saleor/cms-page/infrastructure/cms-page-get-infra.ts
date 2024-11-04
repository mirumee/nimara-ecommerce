import { graphqlClient } from "#root/graphql/client";
import { parseDataToCMSFields } from "#root/lib/serializers/cmsData";
import type { CMSPageGetInfra } from "#root/use-cases/cms-page/types";

import { PageDocument } from "../graphql/queries/generated";
import type { SaleorCMSPageServiceConfig } from "../types";

export const saleorCMSPageGetInfra =
  ({ apiURL }: SaleorCMSPageServiceConfig): CMSPageGetInfra =>
  async ({ languageCode, slug, options }) => {
    const { data } = await graphqlClient(apiURL).execute(PageDocument, {
      options,
      variables: {
        languageCode,
        slug,
      },
    });

    if (!data?.page) {
      return null;
    }

    return {
      title: data.page.title,
      content: data.page.content,
      fields: parseDataToCMSFields(data.page.attributes, "saleor"),
    };
  };
