export type SearchProduct = {
  currency: string;
  id: string;
  media:
    | {
        alt: string;
        url: string;
      }[]
    | null;
  name: string;
  price: number;
  productId: string;
  slug: string;
  thumbnail: {
    alt?: string;
    url: string;
  } | null;
  updatedAt: Date;
};
