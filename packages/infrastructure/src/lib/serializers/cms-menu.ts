import type {
  ButterCMSMenuItem,
  ButterCMSMenuItemChild,
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
): string => {
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

  return `${process.env.BASE_URL}/search?${queryParams.toString()}`;
};

const serializeSaleorMenuItemChild = (
  child: MenuGet_menu_Menu_items_MenuItem_children_MenuItem,
): MenuItemChild => {
  const { id, name, translation, url, collection, category, page } = child;

  // INFO: Links in Saleor CMS cannot be relative links, they must be absolute URLs,
  // so to preserve locale prefixes we need to cut the domain to make them relatives
  const formattedUrl = url?.replace(process.env.BASE_URL ?? "", "");

  return {
    id,
    label: translation?.name || name,
    url: formattedUrl ?? createMenuItemUrl(category, collection, page),
    description:
      collection?.translation?.description ||
      collection?.description ||
      category?.translation?.description ||
      category?.description ||
      null,

    collectionImageUrl: collection?.backgroundImage?.url || null,
  };
};

const serializeSaleorMenuItem = (
  item: MenuGet_menu_Menu_items_MenuItem,
): MenuItem => {
  const { id, name, translation, url, children, category, collection, page } =
    item;

  // INFO: Links in Saleor CMS cannot be relative links, they must be absolute URLs,
  // so to preserve locale prefixes we need to cut the domain to make them relatives
  const formattedUrl = url?.replace(process.env.BASE_URL ?? "", "");

  return {
    id,
    label: translation?.name || name,
    url: formattedUrl ?? createMenuItemUrl(category, collection, page),
    children: children?.map(serializeSaleorMenuItemChild) || [],
  };
};

export const serializeSaleorMenu = (
  items: MenuGet_menu_Menu_items_MenuItem[],
): Menu => {
  return {
    items: items.map(serializeSaleorMenuItem),
  };
};

const serializeButterCMSMenuItemChild = (
  child: ButterCMSMenuItemChild,
): MenuItemChild => {
  return {
    id: child.meta.id.toString(),
    label: child.name,
    url:
      child.url ||
      createMenuItemUrl(
        child.category_slug ? { slug: child.category_slug } : null,
        child.collection_slug ? { slug: child.collection_slug } : null,
        child.page_slug ? { slug: child.page_slug } : null,
      ),
    description: child.description || null,
    collectionImageUrl: child.image || null,
  };
};

export const serializeButterCMSMenuItem = async (
  items: ButterCMSMenuItem[],
  fetchSubMenuItems: () => Promise<ButterCMSMenuItemChild[]>,
): Promise<MenuItem[]> => {
  const submenuItems = await fetchSubMenuItems();

  const findSubMenuItemsById = (id: string): MenuItemChild[] => {
    const matchedItems = submenuItems
      .filter((submenuItem) => submenuItem.meta.id.toString() === id)
      .map(serializeButterCMSMenuItemChild);

    return matchedItems;
  };

  return items.map((item) => {
    const extractedIds = item.navigation_menu_second_level
      ?.map((navItem) => {
        const id = navItem
          .split("navigation_menu_item_second_level[_id=")[1]
          ?.split("]")[0];

        return id;
      })
      .filter(Boolean) as string[];

    const children: MenuItemChild[] | null =
      extractedIds?.flatMap((id) => findSubMenuItemsById(id)) || null;

    return {
      id: item.meta.id.toString(),
      label: item.name,
      url:
        item.url ||
        createMenuItemUrl(
          item.category.length > 0 ? { slug: item.name.toLowerCase() } : null,
          null,
          item.page
            ? {
                slug:
                  typeof item.page === "string"
                    ? item.page.split("/").filter(Boolean).pop() || ""
                    : "",
              }
            : null,
        ),
      children,
    };
  });
};
