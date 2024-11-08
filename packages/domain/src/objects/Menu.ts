type Product = {
  attributes: {
    attribute: {
      name: string | null;
      slug: string | null;
      translation: { name: string } | null;
    };
  }[];
  id: string;
};

export type Category = {
  id: string;
  name: string;
  products?: {
    edges: {
      node: Product;
    }[];
  } | null;
  slug: string;
  translation?: { name: string | null } | null;
};

type Collection = {
  id: string;
  name: string;
  slug: string;
  translation: { name: string | null } | null;
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  translation?: { title: string | null } | null;
};

export type MenuItem = {
  category: Category | null;
  children?: MenuItem[] | null;
  collection?: Collection | null;
  id: string;
  level?: number;
  name: string;
  page: Page | null;
  translation?: { name: string } | null;
  url: string | null;
};

export type Menu = {
  items: MenuItem[];
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
