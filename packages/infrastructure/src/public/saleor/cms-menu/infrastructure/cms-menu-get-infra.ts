import type { Menu, MenuItem } from "@nimara/domain/objects/Menu";

import { graphqlClient } from "#root/graphql/client";

import {
  type MenuGet_menu_Menu_items_MenuItem,
  MenuGetDocument,
} from "../graphql/queries/generated";
import type { CMSMenuGetInfra, SaleorCMSMenuServiceConfig } from "../types";

const serializeMenuItem = ({
  id,
  name,
  translation,
  level,
  url,
  category,
  collection,
  page,
  children,
}: MenuGet_menu_Menu_items_MenuItem): MenuItem => {
  return {
    id,
    name: translation?.name || name,
    translation,
    level,
    url,
    category: category
      ? {
          ...category,
          name: category.translation?.name || category.name,
          description:
            category.translation?.description || category.description,
        }
      : null,
    collection: collection
      ? {
          ...collection,
          name: collection.translation?.name || collection.name,
          description:
            collection.translation?.description || collection.description,
        }
      : null,
    page: page
      ? {
          ...page,
          title: page.translation?.title || page.title,
        }
      : null,
    children,
  };
};

const serializeMenu = (items: MenuGet_menu_Menu_items_MenuItem[]): Menu => {
  return {
    items: items.map(serializeMenuItem),
  };
};

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
