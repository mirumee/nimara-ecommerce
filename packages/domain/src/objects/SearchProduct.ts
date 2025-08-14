import { type TaxedPrice } from "./common";

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
  price: TaxedPrice;
  slug: string;
  thumbnail: {
    alt?: string;
    url: string;
  } | null;
  undiscountedPrice?: TaxedPrice;
  updatedAt: Date;
};
