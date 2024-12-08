import type {
  ButterCMSMenuItem,
  Menu,
  MenuItem,
  MenuItemChild,
} from "@nimara/domain/objects/Menu";

import type {
  MenuGet_menu_Menu_items_MenuItem,
  MenuGet_menu_Menu_items_MenuItem_children_MenuItem,
} from "#root/public/saleor/cms-menu/graphql/queries/generated";

const createMenuItemUrl = (
  category?: { slug: string } | null,
  collection?: { slug: string } | null,
  page?: { slug: string } | null,
): string | null => {
  if (page?.slug) {
    return `${process.env.BASE_URL}/page/${page.slug}`;
  }
  const queryParams = new URLSearchParams();

  if (category?.slug) {
    queryParams.append("category", category.slug);
  }

  if (collection?.slug) {
    queryParams.append("collection", collection.slug);
  }

  return queryParams.toString()
    ? `${process.env.BASE_URL}/search?${queryParams.toString()}`
    : null;
};

const serializeMenuItemChild = (
  child: MenuGet_menu_Menu_items_MenuItem_children_MenuItem,
): MenuItemChild => {
  const { id, name, translation, url, collection, category, page } = child;

  return {
    id,
    label: translation?.name || name,
    url: url || createMenuItemUrl(category, collection, page) || "#",
    description:
      collection?.translation?.description ||
      collection?.description ||
      category?.translation?.description ||
      category?.description ||
      null,

    collectionImageUrl: collection?.backgroundImage?.url || null,
  };
};

const serializeMenuItem = (
  item: MenuGet_menu_Menu_items_MenuItem,
): MenuItem => {
  const { id, name, translation, url, children, category, collection, page } =
    item;

  return {
    id,
    label: translation?.name || name,
    url: url || createMenuItemUrl(category, collection, page) || "#",
    children: children?.map(serializeMenuItemChild) || [],
  };
};

export const serializeMenu = (
  items: MenuGet_menu_Menu_items_MenuItem[],
): Menu => {
  return {
    items: items.map(serializeMenuItem),
  };
};

export const serializeButterCMSMenuItem = (
  items: ButterCMSMenuItem[],
): MenuItem[] => {
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
