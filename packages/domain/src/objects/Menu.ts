export type MenuItem = {
  children?: MenuItemChild[] | null;
  id: string;
  label: string;
  url: string;
};

export type Menu = {
  items: MenuItem[];
};

export type MenuItemChild = {
  collectionImageUrl?: string | null;
  description?: string | null;
  id: string;
  label: string;
  url: string;
};

export type ButterCMSMenuItem = {
  category: string[];
  meta: {
    id: string;
  };
  name: string;
  navigation_menu_second_level?: string[] | [];
  page: string;
  translation: string | null;
  url: string;
};

export type ButterCMSMenuItemChild = {
  category_slug: string | null;
  collection_slug: string | null;
  description: string | null;
  image: string | null;
  meta: {
    id: string;
  };
  name: string;
  page_slug: string | null;
  url: string;
};
