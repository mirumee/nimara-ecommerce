
export interface SaleorError {
  field?: string;
  path?: string;
  message: string;
}

export interface Edge<T> {
  node: T;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export interface IdNode {
  id: string;
}

export interface BulkDeleteResponse {
  [key: string]: {
    count: number;
    errors: SaleorError[];
  };
}

export interface AttributeCreateResponse {
  attributeCreate: {
    attribute: { id: string; name: string } | null;
    errors: SaleorError[];
  };
}

export interface AttributeBulkCreateResponse {
  attributeBulkCreate: {
    results: {
      attribute: { id: string; name: string } | null;
      errors: SaleorError[];
    }[];
    count: number;
  };
}

export interface PageTypeCreateResponse {
  pageTypeCreate: {
    pageType: { id: string; name: string } | null;
    errors: SaleorError[];
  };
}

export interface PageCreateResponse {
  pageCreate: {
    page: { id: string; title: string; slug: string; content: string } | null;
    errors: SaleorError[];
  };
}

export interface MenuCreateResponse {
  menuCreate: {
    menu: { id: string; name: string } | null;
    errors: SaleorError[];
  };
}

export interface MenuItemCreateResponse {
  menuItemCreate: {
    menuItem: { id: string; name: string } | null;
    errors: SaleorError[];
  };
}

export interface ProductTypeCreateResponse {
  productTypeCreate: {
    productType: { id: string; name: string } | null;
    errors: SaleorError[];
  };
}

export interface CategoryCreateResponse {
  categoryCreate: {
    category: { id: string; name: string; slug: string } | null;
    errors: SaleorError[];
  };
}

export interface CategoryMock {
  name: string;
  slug: string;
  children?: CategoryMock[];
}

export interface ProductCreateResponse {
  productCreate: {
    product: { id: string; name: string } | null;
    errors: SaleorError[];
  };
}

export interface ProductBulkCreateResponse {
  productBulkCreate: {
    results: {
      product: { id: string; name: string } | null;
      errors: SaleorError[];
    }[];
    count: number;
  };
}

export interface ProductVariantCreateResponse {
  productVariantCreate: {
    productVariant: { id: string; name: string } | null;
    errors: SaleorError[];
  };
}

export interface ProductChannelListingUpdateResponse {
  productChannelListingUpdate: {
    product: { id: string } | null;
    errors: SaleorError[];
  };
}

export interface ChannelNode {
  id: string;
  slug: string;
}

export interface ChannelsQueryResponse {
  channels: ChannelNode[];
}

export interface MockData {
  categories: CategoryMock[];
  staticPages: {
    title: string;
    slug: string;
    content?: string;
  }[];
  productTypes: {
    name: string;
    hasVariants: boolean;
    isShippingRequired: boolean;
  }[];
  products: {
    name: string;
    category: string;
    productType: string;
    description: string;
    price?: number;
    sku?: string;
    variants?: { sku: string; name: string; price: number }[];
  }[];
}

export interface ShopQueryResponse {
  shop: { name: string };
}

export interface HomepageAttribute {
  name: string;
  type: string;
  inputType: string;
  entityType?: string | null;
  slug: string
}
