import { graphqlClient } from "#root/graphql/client";
import { serializeMenu } from "#root/lib/serializers/cms-menu";
import type { CMSMenuGetInfra } from "#root/use-cases/cms-menu/types";

import { MenuGetDocument } from "../graphql/queries/generated";
import type { SaleorCMSMenuServiceConfig } from "../types";

export const saleorCMSMenuGetInfra =
  ({ apiURL }: SaleorCMSMenuServiceConfig): CMSMenuGetInfra =>
  async ({ channel, languageCode, slug, id, options }) => {
    const { data } = await graphqlClient(apiURL).execute(MenuGetDocument, {
      options,
      variables: {
        channel,
        languageCode,
        slug,
        id,
      },
    });

    if (data?.menu) {
      return { menu: serializeMenu(data.menu.items || []) };
    }

    return null;
  };
