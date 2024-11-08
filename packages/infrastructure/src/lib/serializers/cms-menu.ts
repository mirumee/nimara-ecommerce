import type {
  ButterCMSMenuItem,
  Menu,
  MenuItem,
} from "@nimara/domain/objects/Menu";

import type { MenuGet_menu_Menu_items_MenuItem } from "#root/public/saleor/cms-menu/graphql/queries/generated";

const serializeSaleorMenuItem = ({
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
        }
      : null,
    collection: collection
      ? {
          ...collection,
          name: collection.translation?.name || collection.name,
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

const serializeButterCMSMenuItem = (items: ButterCMSMenuItem[]): MenuItem[] => {
  return items.map((item) => {
    const categoryId = item.category.length
      ? item.category[0].split("category[_id=")[1]?.split("]")[0] || ""
      : "";

    const category = categoryId
      ? {
          id: categoryId,
          name: item.name,
          slug: item.name.toLowerCase(),
          translation: null,
        }
      : null;

    const pageSlug =
      typeof item.page === "string"
        ? item.page.split("/").filter(Boolean).pop() || ""
        : "";
    const page = item.page
      ? {
          id: item.meta.id.toString(),
          slug: pageSlug,
          title: item.name,
          translation: null,
        }
      : null;

    return {
      id: item.meta.id.toString(),
      name: item.name,
      translation: null,
      level: 0,
      url: item.url,
      category,
      collection: null,
      page,
      children: null,
    };
  });
};

export const serializeMenu = (
  items: MenuGet_menu_Menu_items_MenuItem[] | ButterCMSMenuItem[],
  source: "saleor" | "butterCms",
): Menu => {
  if (source === "saleor") {
    return {
      items: (items as MenuGet_menu_Menu_items_MenuItem[]).map(
        serializeSaleorMenuItem,
      ),
    };
  } else if (source === "butterCms") {
    return {
      items: serializeButterCMSMenuItem(items as ButterCMSMenuItem[]),
    };
  }

  return { items: [] };
};
