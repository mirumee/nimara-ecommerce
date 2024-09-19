import { graphqlClient } from "#root/graphql/client";
import { parseAttributeData } from "#root/lib/serializers/attribute";
import type { CMSPageGetInfra } from "#root/public/saleor/cms-page/types";

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
      attributes: data.page.attributes.map(parseAttributeData),
    };
  };
