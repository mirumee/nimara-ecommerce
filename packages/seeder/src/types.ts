export interface SaleorError {
  field?: string;
  path?: string;
  message: string;
}

export interface Edge<T> {
  node: T;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
}

export interface IdNode {
  id: string;
}

export interface NamedNode extends IdNode {
  id: string;
  name: string;
}

/** Single-entity mutation result (e.g. attributeCreate, menuCreate) */
type MutationResult<T> = {
  errors: SaleorError[];
} & T;

/** Wraps a single mutation result under a given key */
type MutationResponse<
  K extends string,
  TEntity extends Record<string, unknown>,
> = {
  [P in K]: MutationResult<TEntity>;
};

/** Bulk mutation with `results[]` + `count` */
type BulkMutationResponse<
  K extends string,
  TEntity extends Record<string, unknown>,
> = {
  [P in K]: {
    results: MutationResult<TEntity>[];
    count: number;
  };
};

interface SlugNode extends NamedNode {
  slug: string;
}

interface PageNode extends SlugNode {
  title: string;
  slug: string;
  content: string;
}

type PageEntityPayload = {
  page: { id: string; title: string; slug: string; content: string } | null;
};

type EntityPayload<K extends string, T = NamedNode> = {
  [P in K]: T | null;
};

export type AttributeCreateResponse = MutationResponse<
  "attributeCreate",
  EntityPayload<"attribute">
>;

export type PageTypeCreateResponse = MutationResponse<
  "pageTypeCreate",
  EntityPayload<"pageType">
>;

export type PageCreateResponse = MutationResponse<
  "pageCreate",
  PageEntityPayload
>;

export type MenuCreateResponse = MutationResponse<
  "menuCreate",
  EntityPayload<"menu">
>;

export type MenuItemCreateResponse = MutationResponse<
  "menuItemCreate",
  EntityPayload<"menuItem">
>;

export type ProductTypeCreateResponse = MutationResponse<
  "productTypeCreate",
  EntityPayload<"productType">
>;

export type CategoryCreateResponse = MutationResponse<
  "categoryCreate",
  EntityPayload<"category", SlugNode>
>;

export type ProductCreateResponse = MutationResponse<
  "productCreate",
  EntityPayload<"product">
>;

export type ProductVariantCreateResponse = MutationResponse<
  "productVariantCreate",
  EntityPayload<"productVariant">
>;

export type ProductChannelListingUpdateResponse = MutationResponse<
  "productChannelListingUpdate",
  EntityPayload<"product", IdNode>
>;

export type AttributeBulkCreateResponse = BulkMutationResponse<
  "attributeBulkCreate",
  EntityPayload<"attribute">
>;

export type ProductBulkCreateResponse = BulkMutationResponse<
  "productBulkCreate",
  EntityPayload<"product">
>;

export interface BulkDeleteResponse {
  [key: string]: {
    count: number;
    errors: SaleorError[];
  };
}

export interface ChannelNode extends IdNode {
  slug: string;
}

export interface ChannelsQueryResponse {
  channels: ChannelNode[];
}

export interface ShopQueryResponse {
  shop: { name: string };
}

export type ProductNode = NamedNode;

export interface CategoryMock {
  name: string;
  slug: string;
  children: CategoryMock[];
}

export interface StaticPageMock {
  title: string;
  slug: string;
  content?: string;
}

export interface GridItemMock {
  header: string;
  subheader: string;
  headerFontColor: string;
  subheaderFontColor: string;
  imageUrl: string;
}

export interface HomepageMock {
  bannerHeader: string;
  bannerButtonText: string;
  bannerImageUrl: string;
  buttonText: string;
  carouselProductCount: number;
  gridItems: GridItemMock[];
}

export interface ProductTypeMock {
  name: string;
  hasVariants: boolean;
  isShippingRequired: boolean;
}

export interface ProductVariantMock {
  sku: string;
  name: string;
  price: number;
}

export interface ProductMock {
  name: string;
  category: string;
  productType: string;
  description: string;
  price?: number;
  sku?: string;
  variants?: ProductVariantMock[];
  photoUrl: string;
}

export interface MockData {
  categories: CategoryMock[];
  staticPages: StaticPageMock[];
  homepage: HomepageMock;
  productTypes: ProductTypeMock[];
  products: ProductMock[];
}

export interface HomepageAttributeValue {
  name: string;
  value: string;
}

export interface HomepageAttribute {
  name: string;
  type: "PAGE_TYPE";
  inputType: "REFERENCE" | "PLAIN_TEXT" | "FILE" | "SWATCH";
  entityType?: "PRODUCT";
  slug: string;
  source: string;
  values?: HomepageAttributeValue[];
}

export interface FileUploadTask {
  attributeId: string;
  urls: string[];
}

export interface BuildPageAttributesResult {
  attributes: Record<string, unknown>[];
  fileUploads: FileUploadTask[];
}
