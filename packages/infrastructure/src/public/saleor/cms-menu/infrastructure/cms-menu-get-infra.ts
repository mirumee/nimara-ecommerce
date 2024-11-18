import { graphqlClient } from "#root/graphql/client";
import { serializeSaleorMenuItem } from "#root/lib/serializers/cms-menu";
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

    if (!data?.menu || !data.menu.items) {
      return null;
    }
    const serializedItems = data.menu.items.map((item) =>
      serializeSaleorMenuItem(item),
    );

    return { menu: { items: serializedItems } };
  };
