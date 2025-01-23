import { graphqlClient } from "#root/graphql/client";
import { serializeSaleorMenu } from "#root/lib/serializers/cms-menu";
import type { CMSMenuGetInfra } from "#root/use-cases/cms-menu/types";

import { MenuGetDocument } from "../graphql/queries/generated";
import type { SaleorCMSMenuServiceConfig } from "../types";

export const saleorCMSMenuGetInfra =
  ({ apiURL }: SaleorCMSMenuServiceConfig): CMSMenuGetInfra =>
  async ({ channel, languageCode, slug, id, options, locale }) => {
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
      return { menu: serializeSaleorMenu(data.menu.items || [], locale) };
    }

    return null;
  };
