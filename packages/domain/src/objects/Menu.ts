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

type Category = {
  description: string | null;
  id: string;
  name: string;
  products: {
    edges: {
      node: Product;
    }[];
  } | null;
  slug: string;
  translation: { description: string | null; name: string | null } | null;
};

type Collection = {
  backgroundImage: { url: string } | null;
  description: string | null;
  id: string;
  name: string;
  slug: string;
  translation: { description: string | null; name: string | null } | null;
};

type Page = {
  id: string;
  slug: string;
  title: string;
  translation: { title: string | null } | null;
};

export type MenuItem = {
  category: Category | null;
  children?: MenuItem[] | null;
  collection: Collection | null;
  id: string;
  level: number;
  name: string;
  page: Page | null;
  translation: { name: string } | null;
  url: string | null;
};

export type Menu = {
  items: MenuItem[];
};
