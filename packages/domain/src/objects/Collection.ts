import { type SearchProduct } from "./SearchProduct";

export type Collection = {
  description: string | null;
  id: string;
  name: string;
  products: SearchProduct[];
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  thumbnail: {
    alt?: string;
    url: string;
  } | null;
};
