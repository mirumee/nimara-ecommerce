export type SearchProduct = {
  currency: string;
  discount: number | null;
  id: string;
  media:
    | {
        alt: string;
        url: string;
      }[]
    | null;
  name: string;
  price: number;
  slug: string;
  thumbnail: {
    alt?: string;
    url: string;
  } | null;
  updatedAt: Date;
};
