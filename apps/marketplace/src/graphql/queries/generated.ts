import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Channels_channels_Channel_defaultCountry_CountryDisplay = { code: string, country: string };

export type Channels_channels_Channel = { id: string, name: string, slug: string, currencyCode: string, isActive: boolean, defaultCountry: Channels_channels_Channel_defaultCountry_CountryDisplay };

export type Channels_Query = { channels: Array<Channels_channels_Channel> | null };


export type ChannelsVariables = Types.Exact<{ [key: string]: never; }>;


export type Channels = Channels_Query;

export type Me_me_User_metadata_MetadataItem = { key: string, value: string };

export type Me_me_User_addresses_Address_country_CountryDisplay = { country: string, code: string };

export type Me_me_User_addresses_Address = { id: string, firstName: string, lastName: string, streetAddress1: string, streetAddress2: string, city: string, postalCode: string, phone: string | null, isDefaultBillingAddress: boolean | null, isDefaultShippingAddress: boolean | null, country: Me_me_User_addresses_Address_country_CountryDisplay };

export type Me_me_User = { id: string, email: string, firstName: string, lastName: string, metadata: Array<Me_me_User_metadata_MetadataItem>, addresses: Array<Me_me_User_addresses_Address> };

export type Me_Query = { me: Me_me_User | null };


export type MeVariables = Types.Exact<{ [key: string]: never; }>;


export type Me = Me_Query;

export type Order_order_Order_total_TaxedMoney_gross_Money = { amount: number, currency: string };

export type Order_order_Order_total_TaxedMoney_net_Money = { amount: number, currency: string };

export type Order_order_Order_total_TaxedMoney_tax_Money = { amount: number, currency: string };

export type Order_order_Order_total_TaxedMoney = { gross: Order_order_Order_total_TaxedMoney_gross_Money, net: Order_order_Order_total_TaxedMoney_net_Money, tax: Order_order_Order_total_TaxedMoney_tax_Money };

export type Order_order_Order_subtotal_TaxedMoney_gross_Money = { amount: number, currency: string };

export type Order_order_Order_subtotal_TaxedMoney = { gross: Order_order_Order_subtotal_TaxedMoney_gross_Money };

export type Order_order_Order_shippingPrice_TaxedMoney_gross_Money = { amount: number, currency: string };

export type Order_order_Order_shippingPrice_TaxedMoney = { gross: Order_order_Order_shippingPrice_TaxedMoney_gross_Money };

export type Order_order_Order_user_User = { id: string, email: string, firstName: string, lastName: string };

export type Order_order_Order_billingAddress_Address_country_CountryDisplay = { country: string, code: string };

export type Order_order_Order_billingAddress_Address = { firstName: string, lastName: string, streetAddress1: string, streetAddress2: string, city: string, postalCode: string, phone: string | null, country: Order_order_Order_billingAddress_Address_country_CountryDisplay };

export type Order_order_Order_shippingAddress_Address_country_CountryDisplay = { country: string, code: string };

export type Order_order_Order_shippingAddress_Address = { firstName: string, lastName: string, streetAddress1: string, streetAddress2: string, city: string, postalCode: string, phone: string | null, country: Order_order_Order_shippingAddress_Address_country_CountryDisplay };

export type Order_order_Order_lines_OrderLine_unitPrice_TaxedMoney_gross_Money = { amount: number, currency: string };

export type Order_order_Order_lines_OrderLine_unitPrice_TaxedMoney = { gross: Order_order_Order_lines_OrderLine_unitPrice_TaxedMoney_gross_Money };

export type Order_order_Order_lines_OrderLine_totalPrice_TaxedMoney_gross_Money = { amount: number, currency: string };

export type Order_order_Order_lines_OrderLine_totalPrice_TaxedMoney = { gross: Order_order_Order_lines_OrderLine_totalPrice_TaxedMoney_gross_Money };

export type Order_order_Order_lines_OrderLine_thumbnail_Image = { url: string, alt: string | null };

export type Order_order_Order_lines_OrderLine = { id: string, productName: string, variantName: string, productSku: string | null, quantity: number, unitPrice: Order_order_Order_lines_OrderLine_unitPrice_TaxedMoney, totalPrice: Order_order_Order_lines_OrderLine_totalPrice_TaxedMoney, thumbnail: Order_order_Order_lines_OrderLine_thumbnail_Image | null };

export type Order_order_Order_events_OrderEvent_user_User = { email: string };

export type Order_order_Order_events_OrderEvent = { id: string, date: string | null, type: Types.OrderEventsEnum | null, message: string | null, user: Order_order_Order_events_OrderEvent_user_User | null };

export type Order_order_Order_fulfillments_Fulfillment_lines_FulfillmentLine_orderLine_OrderLine = { productName: string };

export type Order_order_Order_fulfillments_Fulfillment_lines_FulfillmentLine = { id: string, quantity: number, orderLine: Order_order_Order_fulfillments_Fulfillment_lines_FulfillmentLine_orderLine_OrderLine | null };

export type Order_order_Order_fulfillments_Fulfillment = { id: string, status: Types.FulfillmentStatus, created: string, trackingNumber: string, lines: Array<Order_order_Order_fulfillments_Fulfillment_lines_FulfillmentLine> | null };

export type Order_order_Order = { id: string, number: string, created: string, status: Types.OrderStatus, paymentStatus: Types.PaymentChargeStatusEnum, total: Order_order_Order_total_TaxedMoney, subtotal: Order_order_Order_subtotal_TaxedMoney, shippingPrice: Order_order_Order_shippingPrice_TaxedMoney, user: Order_order_Order_user_User | null, billingAddress: Order_order_Order_billingAddress_Address | null, shippingAddress: Order_order_Order_shippingAddress_Address | null, lines: Array<Order_order_Order_lines_OrderLine>, events: Array<Order_order_Order_events_OrderEvent>, fulfillments: Array<Order_order_Order_fulfillments_Fulfillment> };

export type Order_Query = { order: Order_order_Order | null };


export type OrderVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type Order = Order_Query;

export type Orders_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_total_TaxedMoney_gross_Money = { amount: number, currency: string };

export type Orders_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_total_TaxedMoney = { gross: Orders_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_total_TaxedMoney_gross_Money };

export type Orders_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_user_User = { email: string, firstName: string, lastName: string };

export type Orders_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_shippingAddress_Address_country_CountryDisplay = { country: string };

export type Orders_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_shippingAddress_Address = { city: string, country: Orders_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_shippingAddress_Address_country_CountryDisplay };

export type Orders_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order = { id: string, number: string, created: string, status: Types.OrderStatus, paymentStatus: Types.PaymentChargeStatusEnum, total: Orders_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_total_TaxedMoney, user: Orders_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_user_User | null, shippingAddress: Orders_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_shippingAddress_Address | null };

export type Orders_orders_OrderCountableConnection_edges_OrderCountableEdge = { cursor: string, node: Orders_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order };

export type Orders_orders_OrderCountableConnection_pageInfo_PageInfo = { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null };

export type Orders_orders_OrderCountableConnection = { totalCount: number | null, edges: Array<Orders_orders_OrderCountableConnection_edges_OrderCountableEdge>, pageInfo: Orders_orders_OrderCountableConnection_pageInfo_PageInfo };

export type Orders_Query = { orders: Orders_orders_OrderCountableConnection | null };


export type OrdersVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  filter?: Types.InputMaybe<Types.OrderFilterInput>;
}>;


export type Orders = Orders_Query;

export type Product_product_Product_thumbnail_Image = { url: string, alt: string | null };

export type Product_product_Product_media_ProductMedia = { id: string, url: string, alt: string, type: Types.ProductMediaType };

export type Product_product_Product_productType_ProductType = { id: string, name: string };

export type Product_product_Product_category_Category = { id: string, name: string };

export type Product_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money = { amount: number, currency: string };

export type Product_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney = { gross: Product_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money };

export type Product_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_gross_Money = { amount: number, currency: string };

export type Product_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney = { gross: Product_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_gross_Money };

export type Product_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange = { start: Product_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney | null, stop: Product_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney | null };

export type Product_product_Product_pricing_ProductPricingInfo = { priceRange: Product_product_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange | null };

export type Product_product_Product_channelListings_ProductChannelListing_channel_Channel = { id: string, name: string };

export type Product_product_Product_channelListings_ProductChannelListing_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money = { amount: number, currency: string };

export type Product_product_Product_channelListings_ProductChannelListing_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney = { gross: Product_product_Product_channelListings_ProductChannelListing_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money };

export type Product_product_Product_channelListings_ProductChannelListing_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange = { start: Product_product_Product_channelListings_ProductChannelListing_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney | null };

export type Product_product_Product_channelListings_ProductChannelListing_pricing_ProductPricingInfo = { priceRange: Product_product_Product_channelListings_ProductChannelListing_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange | null };

export type Product_product_Product_channelListings_ProductChannelListing = { id: string, isPublished: boolean, visibleInListings: boolean, availableForPurchase: string | null, channel: Product_product_Product_channelListings_ProductChannelListing_channel_Channel, pricing: Product_product_Product_channelListings_ProductChannelListing_pricing_ProductPricingInfo | null };

export type Product_product_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money = { amount: number, currency: string };

export type Product_product_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney = { gross: Product_product_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money };

export type Product_product_Product_variants_ProductVariant_pricing_VariantPricingInfo = { price: Product_product_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney | null };

export type Product_product_Product_variants_ProductVariant_stocks_Stock_warehouse_Warehouse = { name: string };

export type Product_product_Product_variants_ProductVariant_stocks_Stock = { quantity: number, quantityAllocated: number, warehouse: Product_product_Product_variants_ProductVariant_stocks_Stock_warehouse_Warehouse };

export type Product_product_Product_variants_ProductVariant = { id: string, name: string, sku: string | null, pricing: Product_product_Product_variants_ProductVariant_pricing_VariantPricingInfo | null, stocks: Array<Product_product_Product_variants_ProductVariant_stocks_Stock> | null };

export type Product_product_Product_attributes_SelectedAttribute_attribute_Attribute = { id: string, name: string | null, slug: string | null };

export type Product_product_Product_attributes_SelectedAttribute_values_AttributeValue = { id: string, name: string | null, slug: string | null };

export type Product_product_Product_attributes_SelectedAttribute = { attribute: Product_product_Product_attributes_SelectedAttribute_attribute_Attribute, values: Array<Product_product_Product_attributes_SelectedAttribute_values_AttributeValue> };

export type Product_product_Product_metadata_MetadataItem = { key: string, value: string };

export type Product_product_Product = { id: string, name: string, slug: string, description: string | null, seoTitle: string | null, seoDescription: string | null, thumbnail: Product_product_Product_thumbnail_Image | null, media: Array<Product_product_Product_media_ProductMedia> | null, productType: Product_product_Product_productType_ProductType, category: Product_product_Product_category_Category | null, pricing: Product_product_Product_pricing_ProductPricingInfo | null, channelListings: Array<Product_product_Product_channelListings_ProductChannelListing> | null, variants: Array<Product_product_Product_variants_ProductVariant> | null, attributes: Array<Product_product_Product_attributes_SelectedAttribute>, metadata: Array<Product_product_Product_metadata_MetadataItem> };

export type Product_Query = { product: Product_product_Product | null };


export type ProductVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type Product = Product_Query;

export type Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_thumbnail_Image = { url: string, alt: string | null };

export type Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType = { name: string };

export type Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_category_Category = { name: string };

export type Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money = { amount: number, currency: string };

export type Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney = { gross: Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money };

export type Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange = { start: Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney | null };

export type Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo = { priceRange: Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange | null };

export type Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_channelListings_ProductChannelListing_channel_Channel = { name: string };

export type Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_channelListings_ProductChannelListing = { isPublished: boolean, channel: Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_channelListings_ProductChannelListing_channel_Channel };

export type Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product = { id: string, name: string, slug: string, thumbnail: Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_thumbnail_Image | null, productType: Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType, category: Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_category_Category | null, pricing: Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo | null, channelListings: Array<Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_channelListings_ProductChannelListing> | null };

export type Products_products_ProductCountableConnection_edges_ProductCountableEdge = { cursor: string, node: Products_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product };

export type Products_products_ProductCountableConnection_pageInfo_PageInfo = { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null };

export type Products_products_ProductCountableConnection = { totalCount: number | null, edges: Array<Products_products_ProductCountableConnection_edges_ProductCountableEdge>, pageInfo: Products_products_ProductCountableConnection_pageInfo_PageInfo };

export type Products_Query = { products: Products_products_ProductCountableConnection | null };


export type ProductsVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  filter?: Types.InputMaybe<Types.ProductFilterInput>;
}>;


export type Products = Products_Query;

export type Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge_node_Warehouse_address_Address_country_CountryDisplay = { country: string, code: string };

export type Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge_node_Warehouse_address_Address = { streetAddress1: string, streetAddress2: string, city: string, postalCode: string, phone: string | null, country: Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge_node_Warehouse_address_Address_country_CountryDisplay };

export type Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge_node_Warehouse_shippingZones_ShippingZoneCountableConnection_edges_ShippingZoneCountableEdge_node_ShippingZone = { id: string, name: string };

export type Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge_node_Warehouse_shippingZones_ShippingZoneCountableConnection_edges_ShippingZoneCountableEdge = { node: Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge_node_Warehouse_shippingZones_ShippingZoneCountableConnection_edges_ShippingZoneCountableEdge_node_ShippingZone };

export type Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge_node_Warehouse_shippingZones_ShippingZoneCountableConnection = { edges: Array<Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge_node_Warehouse_shippingZones_ShippingZoneCountableConnection_edges_ShippingZoneCountableEdge> };

export type Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge_node_Warehouse = { id: string, name: string, slug: string, address: Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge_node_Warehouse_address_Address, shippingZones: Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge_node_Warehouse_shippingZones_ShippingZoneCountableConnection };

export type Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge = { node: Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge_node_Warehouse };

export type Warehouses_warehouses_WarehouseCountableConnection = { totalCount: number | null, edges: Array<Warehouses_warehouses_WarehouseCountableConnection_edges_WarehouseCountableEdge> };

export type Warehouses_Query = { warehouses: Warehouses_warehouses_WarehouseCountableConnection | null };


export type WarehousesVariables = Types.Exact<{ [key: string]: never; }>;


export type Warehouses = Warehouses_Query;

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