export type Category = {
  backgroundImage: {
    alt?: string;
    url: string;
  } | null;
  description: string | null;
  id: string;
  name: string;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
};
