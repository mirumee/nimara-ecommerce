export type CMSPage = {
  content: string | null;
  fields: PageField[];
  title: string;
};

export type PageField = {
  imageUrl?: string;
  reference?: string[];
  slug: string | null;
  text?: string;
};

export type ButterCMSPageFields = {
  [key: string]: string | ButterCMSProduct[] | null;
};

type ButterCMSProduct = {
  id: string;
  product: string;
};

export enum PageType {
  HOMEPAGE = "homepage",
  STATIC_PAGE = "static_page",
}
