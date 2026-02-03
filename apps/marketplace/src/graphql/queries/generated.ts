import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type ChannelsVariables = Types.Exact<{ [key: string]: never; }>;


export type Channels = { __typename?: 'Query', channels?: Array<{ __typename?: 'Channel', id: string, name: string, slug: string, currencyCode: string, isActive: boolean, defaultCountry?: { __typename?: 'Country', code: string, country: string } | null }> | null };

export type MeVariables = Types.Exact<{ [key: string]: never; }>;


export type Me = { __typename?: 'Query', me?: { __typename?: 'User', id: string, email?: string | null, firstName?: string | null, lastName?: string | null, metadata?: Array<{ __typename?: 'MetadataItem', key: string, value: string }> | null, addresses?: Array<{ __typename?: 'Address', id: string, firstName?: string | null, lastName?: string | null, streetAddress1?: string | null, streetAddress2?: string | null, city?: string | null, postalCode?: string | null, phone?: string | null, isDefaultBillingAddress?: boolean | null, isDefaultShippingAddress?: boolean | null, country?: { __typename?: 'Country', country: string, code: string } | null } | null> | null } | null };

export type OrderVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type Order = { __typename?: 'Query', order?: { __typename?: 'Order', id: string, number?: string | null, created?: string | null, status: string, paymentStatus: string, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, subtotal: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string } }, user?: { __typename?: 'User', id: string, email?: string | null, firstName?: string | null, lastName?: string | null } | null, billingAddress?: { __typename?: 'Address', firstName?: string | null, lastName?: string | null, streetAddress1?: string | null, streetAddress2?: string | null, city?: string | null, postalCode?: string | null, phone?: string | null, country?: { __typename?: 'Country', country: string, code: string } | null } | null, shippingAddress?: { __typename?: 'Address', firstName?: string | null, lastName?: string | null, streetAddress1?: string | null, streetAddress2?: string | null, city?: string | null, postalCode?: string | null, phone?: string | null, country?: { __typename?: 'Country', country: string, code: string } | null } | null, lines: Array<{ __typename?: 'OrderLine', id: string, productName: string, variantName?: string | null, productSku?: string | null, quantity: number, unitPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string } }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string } }, thumbnail?: { __typename?: 'Image', url: string, alt?: string | null } | null }>, events?: Array<{ __typename?: 'OrderEvent', id: string, date?: string | null, type?: string | null, message?: string | null, user?: { __typename?: 'User', email?: string | null } | null } | null> | null, fulfillments?: Array<{ __typename?: 'Fulfillment', id: string, status: string, created?: string | null, trackingNumber?: string | null, lines: Array<{ __typename?: 'FulfillmentLine', id: string, quantity: number, orderLine?: { __typename?: 'OrderLine', productName: string } | null }> }> | null } | null };

export type OrdersVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  filter?: Types.InputMaybe<Types.OrderFilterInput>;
}>;


export type Orders = { __typename?: 'Query', orders?: { __typename?: 'OrderCountableConnection', totalCount?: number | null, edges: Array<{ __typename?: 'OrderCountableEdge', cursor: string, node: { __typename?: 'Order', id: string, number?: string | null, created?: string | null, status: string, paymentStatus: string, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string } }, user?: { __typename?: 'User', email?: string | null, firstName?: string | null, lastName?: string | null } | null, shippingAddress?: { __typename?: 'Address', city?: string | null, country?: { __typename?: 'Country', country: string } | null } | null } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type ProductVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type Product = { __typename?: 'Query', product?: { __typename?: 'Product', id: string, name: string, slug: string, description?: string | null, seoTitle?: string | null, seoDescription?: string | null, thumbnail?: { __typename?: 'Image', url: string, alt?: string | null } | null, media?: Array<{ __typename?: 'ProductMedia', id: string, url: string, alt?: string | null, type?: string | null } | null> | null, productType?: { __typename?: 'ProductType', id: string, name: string } | null, category?: { __typename?: 'Category', id: string, name: string } | null, pricing?: { __typename?: 'ProductPricingInfo', priceRange?: { __typename?: 'TaxedMoneyRange', start?: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string } } | null, stop?: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string } } | null } | null } | null, channelListings?: Array<{ __typename?: 'ProductChannelListing', id: string, isPublished: boolean, visibleInListings?: boolean | null, availableForPurchase?: boolean | null, channel: { __typename?: 'Channel', id: string, name: string }, pricing?: { __typename?: 'ProductPricingInfo', priceRange?: { __typename?: 'TaxedMoneyRange', start?: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string } } | null } | null } | null }> | null, variants?: Array<{ __typename?: 'ProductVariant', id: string, name: string, sku?: string | null, pricing?: { __typename?: 'VariantPricingInfo', price?: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string } } | null } | null, stocks?: Array<{ __typename?: 'Stock', quantity: number, quantityAllocated: number, warehouse: { __typename?: 'Warehouse', name: string } }> | null } | null> | null, attributes?: Array<{ __typename?: 'SelectedAttribute', attribute: { __typename?: 'Attribute', id: string, name?: string | null, slug?: string | null }, values: Array<{ __typename?: 'AttributeValue', id: string, name?: string | null, slug?: string | null }> }> | null, metadata?: Array<{ __typename?: 'MetadataItem', key: string, value: string }> | null } | null };

export type ProductsVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  filter?: Types.InputMaybe<Types.ProductFilterInput>;
}>;


export type Products = { __typename?: 'Query', products?: { __typename?: 'ProductCountableConnection', totalCount?: number | null, edges: Array<{ __typename?: 'ProductCountableEdge', cursor: string, node: { __typename?: 'Product', id: string, name: string, slug: string, thumbnail?: { __typename?: 'Image', url: string, alt?: string | null } | null, productType?: { __typename?: 'ProductType', name: string } | null, category?: { __typename?: 'Category', name: string } | null, pricing?: { __typename?: 'ProductPricingInfo', priceRange?: { __typename?: 'TaxedMoneyRange', start?: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string } } | null } | null } | null, channelListings?: Array<{ __typename?: 'ProductChannelListing', isPublished: boolean, channel: { __typename?: 'Channel', name: string } }> | null } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type WarehousesVariables = Types.Exact<{ [key: string]: never; }>;


export type Warehouses = { __typename?: 'Query', warehouses?: { __typename?: 'WarehouseCountableConnection', totalCount?: number | null, edges: Array<{ __typename?: 'WarehouseCountableEdge', node: { __typename?: 'Warehouse', id: string, name: string, slug: string, address?: { __typename?: 'Address', streetAddress1?: string | null, streetAddress2?: string | null, city?: string | null, postalCode?: string | null, phone?: string | null, country?: { __typename?: 'Country', country: string, code: string } | null } | null, shippingZones?: { __typename?: 'ShippingZoneCountableConnection', edges: Array<{ __typename?: 'ShippingZoneCountableEdge', node: { __typename?: 'ShippingZone', id: string, name: string } }> } | null } }> } | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const ChannelsDocument = new TypedDocumentString(`
    query Channels {
  channels {
    id
    name
    slug
    currencyCode
    defaultCountry {
      code
      country
    }
    isActive
  }
}
    `) as unknown as TypedDocumentString<Channels, ChannelsVariables>;
export const MeDocument = new TypedDocumentString(`
    query Me {
  me {
    id
    email
    firstName
    lastName
    metadata {
      key
      value
    }
    addresses {
      id
      firstName
      lastName
      streetAddress1
      streetAddress2
      city
      postalCode
      country {
        country
        code
      }
      phone
      isDefaultBillingAddress
      isDefaultShippingAddress
    }
  }
}
    `) as unknown as TypedDocumentString<Me, MeVariables>;
export const OrderDocument = new TypedDocumentString(`
    query Order($id: ID!) {
  order(id: $id) {
    id
    number
    created
    status
    paymentStatus
    total {
      gross {
        amount
        currency
      }
      net {
        amount
        currency
      }
      tax {
        amount
        currency
      }
    }
    subtotal {
      gross {
        amount
        currency
      }
    }
    shippingPrice {
      gross {
        amount
        currency
      }
    }
    user {
      id
      email
      firstName
      lastName
    }
    billingAddress {
      firstName
      lastName
      streetAddress1
      streetAddress2
      city
      postalCode
      country {
        country
        code
      }
      phone
    }
    shippingAddress {
      firstName
      lastName
      streetAddress1
      streetAddress2
      city
      postalCode
      country {
        country
        code
      }
      phone
    }
    lines {
      id
      productName
      variantName
      productSku
      quantity
      unitPrice {
        gross {
          amount
          currency
        }
      }
      totalPrice {
        gross {
          amount
          currency
        }
      }
      thumbnail {
        url
        alt
      }
    }
    events {
      id
      date
      type
      message
      user {
        email
      }
    }
    fulfillments {
      id
      status
      created
      trackingNumber
      lines {
        id
        quantity
        orderLine {
          productName
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<Order, OrderVariables>;
export const OrdersDocument = new TypedDocumentString(`
    query Orders($first: Int, $after: String, $filter: OrderFilterInput) {
  orders(first: $first, after: $after, filter: $filter) {
    edges {
      node {
        id
        number
        created
        status
        paymentStatus
        total {
          gross {
            amount
            currency
          }
        }
        user {
          email
          firstName
          lastName
        }
        shippingAddress {
          city
          country {
            country
          }
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `) as unknown as TypedDocumentString<Orders, OrdersVariables>;
export const ProductDocument = new TypedDocumentString(`
    query Product($id: ID!) {
  product(id: $id) {
    id
    name
    slug
    description
    seoTitle
    seoDescription
    thumbnail {
      url
      alt
    }
    media {
      id
      url
      alt
      type
    }
    productType {
      id
      name
    }
    category {
      id
      name
    }
    pricing {
      priceRange {
        start {
          gross {
            amount
            currency
          }
        }
        stop {
          gross {
            amount
            currency
          }
        }
      }
    }
    channelListings {
      id
      channel {
        id
        name
      }
      isPublished
      visibleInListings
      availableForPurchase
      pricing {
        priceRange {
          start {
            gross {
              amount
              currency
            }
          }
        }
      }
    }
    variants {
      id
      name
      sku
      pricing {
        price {
          gross {
            amount
            currency
          }
        }
      }
      stocks {
        warehouse {
          name
        }
        quantity
        quantityAllocated
      }
    }
    attributes {
      attribute {
        id
        name
        slug
      }
      values {
        id
        name
        slug
      }
    }
    metadata {
      key
      value
    }
  }
}
    `) as unknown as TypedDocumentString<Product, ProductVariables>;
export const ProductsDocument = new TypedDocumentString(`
    query Products($first: Int, $after: String, $search: String, $filter: ProductFilterInput) {
  products(first: $first, after: $after, search: $search, filter: $filter) {
    edges {
      node {
        id
        name
        slug
        thumbnail {
          url
          alt
        }
        productType {
          name
        }
        category {
          name
        }
        pricing {
          priceRange {
            start {
              gross {
                amount
                currency
              }
            }
          }
        }
        channelListings {
          channel {
            name
          }
          isPublished
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `) as unknown as TypedDocumentString<Products, ProductsVariables>;
export const WarehousesDocument = new TypedDocumentString(`
    query Warehouses {
  warehouses(first: 50) {
    edges {
      node {
        id
        name
        slug
        address {
          streetAddress1
          streetAddress2
          city
          postalCode
          country {
            country
            code
          }
          phone
        }
        shippingZones(first: 10) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
    totalCount
  }
}
    `) as unknown as TypedDocumentString<Warehouses, WarehousesVariables>;