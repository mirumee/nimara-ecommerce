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
  page: string;
  url: string;
};
