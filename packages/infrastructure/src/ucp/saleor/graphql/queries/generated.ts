import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_category_Category = { name: string, slug: string };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia = { alt: string, url: string, type: Types.ProductMediaType };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money = { currency: string, amount: number };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney = { gross: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney_gross_Money };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_gross_Money = { currency: string, amount: number };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney = { gross: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney_gross_Money };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange = { start: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_start_TaxedMoney | null, stop: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange_stop_TaxedMoney | null };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRangeUndiscounted_TaxedMoneyRange_start_TaxedMoney_gross_Money = { currency: string, amount: number };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRangeUndiscounted_TaxedMoneyRange_start_TaxedMoney = { gross: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRangeUndiscounted_TaxedMoneyRange_start_TaxedMoney_gross_Money };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRangeUndiscounted_TaxedMoneyRange_stop_TaxedMoney_gross_Money = { currency: string, amount: number };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRangeUndiscounted_TaxedMoneyRange_stop_TaxedMoney = { gross: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRangeUndiscounted_TaxedMoneyRange_stop_TaxedMoney_gross_Money };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRangeUndiscounted_TaxedMoneyRange = { start: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRangeUndiscounted_TaxedMoneyRange_start_TaxedMoney | null, stop: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRangeUndiscounted_TaxedMoneyRange_stop_TaxedMoney | null };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo = { priceRange: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRange_TaxedMoneyRange | null, priceRangeUndiscounted: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo_priceRangeUndiscounted_TaxedMoneyRange | null };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money = { currency: string, amount: number };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney = { gross: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney_gross_Money };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_priceUndiscounted_TaxedMoney_gross_Money = { currency: string, amount: number };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_priceUndiscounted_TaxedMoney = { gross: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_priceUndiscounted_TaxedMoney_gross_Money };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo = { price: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_price_TaxedMoney | null, priceUndiscounted: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo_priceUndiscounted_TaxedMoney | null };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_media_ProductMedia = { alt: string, url: string };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_attributes_SelectedAttribute_attribute_Attribute = { name: string | null, slug: string | null };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_attributes_SelectedAttribute_values_AttributeValue = { name: string | null };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_attributes_SelectedAttribute = { attribute: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_attributes_SelectedAttribute_attribute_Attribute, values: Array<UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_attributes_SelectedAttribute_values_AttributeValue> };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant = { id: string, name: string, sku: string | null, quantityAvailable: number | null, pricing: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_pricing_VariantPricingInfo | null, media: Array<UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_media_ProductMedia> | null, attributes: Array<UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant_attributes_SelectedAttribute> };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType_variantAttributes_Attribute_choices_AttributeValueCountableConnection_edges_AttributeValueCountableEdge_node_AttributeValue = { name: string | null };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType_variantAttributes_Attribute_choices_AttributeValueCountableConnection_edges_AttributeValueCountableEdge = { node: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType_variantAttributes_Attribute_choices_AttributeValueCountableConnection_edges_AttributeValueCountableEdge_node_AttributeValue };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType_variantAttributes_Attribute_choices_AttributeValueCountableConnection = { edges: Array<UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType_variantAttributes_Attribute_choices_AttributeValueCountableConnection_edges_AttributeValueCountableEdge> };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType_variantAttributes_Attribute = { name: string | null, slug: string | null, choices: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType_variantAttributes_Attribute_choices_AttributeValueCountableConnection | null };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType = { variantAttributes: Array<UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType_variantAttributes_Attribute> | null };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product = { id: string, name: string, slug: string, description: string | null, category: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_category_Category | null, media: Array<UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia> | null, pricing: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo | null, variants: Array<UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant> | null, productType: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType };

export type UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge = { node: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product };

export type UcpCatalogLookup_products_ProductCountableConnection = { edges: Array<UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge> };

export type UcpCatalogLookup_Query = { products: UcpCatalogLookup_products_ProductCountableConnection | null };


export type UcpCatalogLookupVariables = Types.Exact<{
  ids: Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input'];
  channel: Types.Scalars['String']['input'];
}>;


export type UcpCatalogLookup = UcpCatalogLookup_Query;

export type UcpCatalogProduct_product_Product = { id: string, name: string, slug: string, description: string | null, category: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_category_Category | null, media: Array<UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia> | null, pricing: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo | null, variants: Array<UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant> | null, productType: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType };

export type UcpCatalogProduct_Query = { product: UcpCatalogProduct_product_Product | null };


export type UcpCatalogProductVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  channel: Types.Scalars['String']['input'];
}>;


export type UcpCatalogProduct = UcpCatalogProduct_Query;

export type UcpCatalogSearch_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product = { id: string, name: string, slug: string, description: string | null, category: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_category_Category | null, media: Array<UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_media_ProductMedia> | null, pricing: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_pricing_ProductPricingInfo | null, variants: Array<UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_variants_ProductVariant> | null, productType: UcpCatalogLookup_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product_productType_ProductType };

export type UcpCatalogSearch_products_ProductCountableConnection_edges_ProductCountableEdge = { cursor: string, node: UcpCatalogSearch_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product };

export type UcpCatalogSearch_products_ProductCountableConnection_pageInfo_PageInfo = { hasNextPage: boolean, endCursor: string | null };

export type UcpCatalogSearch_products_ProductCountableConnection = { totalCount: number | null, edges: Array<UcpCatalogSearch_products_ProductCountableConnection_edges_ProductCountableEdge>, pageInfo: UcpCatalogSearch_products_ProductCountableConnection_pageInfo_PageInfo };

export type UcpCatalogSearch_Query = { products: UcpCatalogSearch_products_ProductCountableConnection | null };


export type UcpCatalogSearchVariables = Types.Exact<{
  first: Types.Scalars['Int']['input'];
  channel: Types.Scalars['String']['input'];
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  filter?: Types.InputMaybe<Types.ProductFilterInput>;
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type UcpCatalogSearch = UcpCatalogSearch_Query;

export type UcpCheckoutSessionGet_checkout_Checkout_channel_Channel = { slug: string };

export type UcpCheckoutSessionGet_checkout_Checkout_discount_Money = { amount: number, currency: string };

export type UcpCheckoutSessionGet_checkout_Checkout_shippingMethods_ShippingMethod_price_Money = { amount: number, currency: string };

export type UcpCheckoutSessionGet_checkout_Checkout_shippingMethods_ShippingMethod = (
  { id: string, name: string, maximumDeliveryDays: number | null, minimumDeliveryDays: number | null, message: string | null, price: UcpCheckoutSessionGet_checkout_Checkout_shippingMethods_ShippingMethod_price_Money }
  & { __typename: 'ShippingMethod' }
);

export type UcpCheckoutSessionGet_checkout_Checkout_shippingAddress_Address_country_CountryDisplay = { country: string, code: string };

export type UcpCheckoutSessionGet_checkout_Checkout_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: UcpCheckoutSessionGet_checkout_Checkout_shippingAddress_Address_country_CountryDisplay };

export type UcpCheckoutSessionGet_checkout_Checkout_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: UcpCheckoutSessionGet_checkout_Checkout_shippingAddress_Address_country_CountryDisplay };

export type UcpCheckoutSessionGet_checkout_Checkout_deliveryMethod_ShippingMethod_Warehouse = (
  { id: string, name: string }
  & { __typename: 'ShippingMethod' | 'Warehouse' }
);

export type UcpCheckoutSessionGet_checkout_Checkout_availablePaymentGateways_PaymentGateway_config_GatewayConfigLine = { field: string, value: string | null };

export type UcpCheckoutSessionGet_checkout_Checkout_availablePaymentGateways_PaymentGateway = { name: string, id: string, config: Array<UcpCheckoutSessionGet_checkout_Checkout_availablePaymentGateways_PaymentGateway_config_GatewayConfigLine> };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money = { currency: string, amount: number };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_tax_Money = { currency: string, amount: number };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money = { currency: string, amount: number };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney = { net: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_net_Money, tax: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_tax_Money, gross: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney_gross_Money };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money = { amount: number, currency: string };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation = { name: string };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia = { url: string, alt: string };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation = { name: string };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute = { slug: string | null, inputType: Types.AttributeInputTypeEnum | null, name: string | null, translation: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute_translation_AttributeTranslation | null };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation = { name: string, plainText: string | null, richText: string | null };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File = { url: string };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue = { slug: string | null, name: string | null, plainText: string | null, richText: string | null, boolean: boolean | null, date: string | null, dateTime: string | null, reference: string | null, value: string | null, translation: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_translation_AttributeValueTranslation | null, file: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue_file_File | null };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute = { attribute: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_attribute_Attribute, values: Array<UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute_values_AttributeValue> };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image = { alt: string | null, url: string };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation = { name: string | null };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product = { id: string, slug: string, name: string, vendorId?: string | null, thumbnail: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_thumbnail_Image | null, translation: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product_translation_ProductTranslation | null };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money = { currency: string, amount: number };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money = { currency: string, amount: number };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money = { currency: string, amount: number };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney = { net: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo = { discount: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney | null };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant = { id: string, quantityAvailable: number | null, quantityLimitPerCustomer: number | null, name: string, sku: string | null, translation: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_translation_ProductVariantTranslation | null, media: Array<UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_media_ProductMedia> | null, selectionAttributes: Array<UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_selectionAttributes_SelectedAttribute>, product: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_product_Product, pricing: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo | null };

export type UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine = { id: string, quantity: number, totalPrice: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type UcpCheckoutSessionGet_checkout_Checkout_totalPrice_TaxedMoney = { net: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type UcpCheckoutSessionGet_checkout_Checkout_subtotalPrice_TaxedMoney = { net: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type UcpCheckoutSessionGet_checkout_Checkout_shippingPrice_TaxedMoney = { net: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type UcpCheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine = { id: string, quantity: number, totalPrice: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type UcpCheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine = { id: string, quantity: number, totalPrice: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_totalPrice_TaxedMoney, undiscountedTotalPrice: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_undiscountedTotalPrice_Money, variant: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant };

export type UcpCheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock = (
  { availableQuantity: number | null, line: UcpCheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemInsufficientStock' }
);

export type UcpCheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable = (
  { line: UcpCheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable_line_CheckoutLine }
  & { __typename: 'CheckoutLineProblemVariantNotAvailable' }
);

export type UcpCheckoutSessionGet_checkout_Checkout_problems =
  | UcpCheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemInsufficientStock
  | UcpCheckoutSessionGet_checkout_Checkout_problems_CheckoutLineProblemVariantNotAvailable
;

export type UcpCheckoutSessionGet_checkout_Checkout = { id: string, email: string | null, displayGrossPrices: boolean, voucherCode: string | null, isShippingRequired: boolean, authorizeStatus: Types.CheckoutAuthorizeStatusEnum, chargeStatus: Types.CheckoutChargeStatusEnum, buyer: string | null, cancelled: string | null, channel: UcpCheckoutSessionGet_checkout_Checkout_channel_Channel, discount: UcpCheckoutSessionGet_checkout_Checkout_discount_Money | null, shippingMethods: Array<UcpCheckoutSessionGet_checkout_Checkout_shippingMethods_ShippingMethod>, shippingAddress: UcpCheckoutSessionGet_checkout_Checkout_shippingAddress_Address | null, billingAddress: UcpCheckoutSessionGet_checkout_Checkout_billingAddress_Address | null, deliveryMethod: UcpCheckoutSessionGet_checkout_Checkout_deliveryMethod_ShippingMethod_Warehouse | null, availablePaymentGateways: Array<UcpCheckoutSessionGet_checkout_Checkout_availablePaymentGateways_PaymentGateway>, lines: Array<UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine>, totalPrice: UcpCheckoutSessionGet_checkout_Checkout_totalPrice_TaxedMoney, subtotalPrice: UcpCheckoutSessionGet_checkout_Checkout_subtotalPrice_TaxedMoney, shippingPrice: UcpCheckoutSessionGet_checkout_Checkout_shippingPrice_TaxedMoney, problems: Array<UcpCheckoutSessionGet_checkout_Checkout_problems> | null };

export type UcpCheckoutSessionGet_Query = { checkout: UcpCheckoutSessionGet_checkout_Checkout | null };


export type UcpCheckoutSessionGetVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  languageCode: Types.LanguageCodeEnum;
  countryCode?: Types.InputMaybe<Types.CountryCode>;
  thumbnailSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  thumbnailFormat?: Types.InputMaybe<Types.ThumbnailFormatEnum>;
  isMarketplaceEnabled?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;


export type UcpCheckoutSessionGet = UcpCheckoutSessionGet_Query;

export type UcpOrderGet_order_Order_metadata_MetadataItem = { key: string, value: string };

export type UcpOrderGet_order_Order_fulfillments_Fulfillment = { id: string, status: Types.FulfillmentStatus };

export type UcpOrderGet_order_Order_lines_OrderLine_discounts_OrderLineDiscount_total_Money = { currency: string, amount: number };

export type UcpOrderGet_order_Order_lines_OrderLine_discounts_OrderLineDiscount = { total: UcpOrderGet_order_Order_lines_OrderLine_discounts_OrderLineDiscount_total_Money };

export type UcpOrderGet_order_Order_lines_OrderLine_unitPrice_TaxedMoney = { net: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type UcpOrderGet_order_Order_lines_OrderLine_totalPrice_TaxedMoney = { net: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_net_Money, gross: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_gross_Money, tax: UcpCheckoutSessionGet_checkout_Checkout_lines_CheckoutLine_variant_ProductVariant_pricing_VariantPricingInfo_discount_TaxedMoney_tax_Money };

export type UcpOrderGet_order_Order_lines_OrderLine = { id: string, quantity: number, quantityFulfilled: number, productName: string, variantName: string, productVariantId: string | null, discounts: Array<UcpOrderGet_order_Order_lines_OrderLine_discounts_OrderLineDiscount> | null, unitPrice: UcpOrderGet_order_Order_lines_OrderLine_unitPrice_TaxedMoney, totalPrice: UcpOrderGet_order_Order_lines_OrderLine_totalPrice_TaxedMoney };

export type UcpOrderGet_order_Order_shippingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: UcpCheckoutSessionGet_checkout_Checkout_shippingAddress_Address_country_CountryDisplay };

export type UcpOrderGet_order_Order_billingAddress_Address = { id: string, city: string, phone: string | null, postalCode: string, companyName: string, cityArea: string, streetAddress1: string, streetAddress2: string, countryArea: string, firstName: string, lastName: string, isDefaultShippingAddress: boolean | null, isDefaultBillingAddress: boolean | null, country: UcpCheckoutSessionGet_checkout_Checkout_shippingAddress_Address_country_CountryDisplay };

export type UcpOrderGet_order_Order = { id: string, checkoutId: string | null, created: string, status: Types.OrderStatus, paymentStatus: Types.PaymentChargeStatusEnum, displayGrossPrices: boolean, metadata: Array<UcpOrderGet_order_Order_metadata_MetadataItem>, fulfillments: Array<UcpOrderGet_order_Order_fulfillments_Fulfillment>, lines: Array<UcpOrderGet_order_Order_lines_OrderLine>, shippingAddress: UcpOrderGet_order_Order_shippingAddress_Address | null, billingAddress: UcpOrderGet_order_Order_billingAddress_Address | null };

export type UcpOrderGet_Query = { order: UcpOrderGet_order_Order | null };


export type UcpOrderGetVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type UcpOrderGet = UcpOrderGet_Query;

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

export const UcpCatalogLookupDocument = new TypedDocumentString(`
    query UCPCatalogLookup($ids: [ID!]!, $channel: String!) {
  products(first: 50, channel: $channel, filter: {ids: $ids}) {
    edges {
      node {
        ...UCPCatalogProductFragment
      }
    }
  }
}
    fragment UCPCatalogProductFragment on Product {
  id
  name
  slug
  description
  category {
    name
    slug
  }
  media {
    alt
    url
    type
  }
  pricing {
    priceRange {
      start {
        gross {
          ...MoneyFragment
        }
      }
      stop {
        gross {
          ...MoneyFragment
        }
      }
    }
    priceRangeUndiscounted {
      start {
        gross {
          ...MoneyFragment
        }
      }
      stop {
        gross {
          ...MoneyFragment
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
          ...MoneyFragment
        }
      }
      priceUndiscounted {
        gross {
          ...MoneyFragment
        }
      }
    }
    quantityAvailable
    media {
      alt
      url
    }
    attributes {
      attribute {
        name
        slug
      }
      values {
        name
      }
    }
  }
  productType {
    variantAttributes {
      name
      slug
      choices(first: 50) {
        edges {
          node {
            name
          }
        }
      }
    }
  }
}
fragment MoneyFragment on Money {
  currency
  amount
}`) as unknown as TypedDocumentString<UcpCatalogLookup, UcpCatalogLookupVariables>;
export const UcpCatalogProductDocument = new TypedDocumentString(`
    query UCPCatalogProduct($id: ID!, $channel: String!) {
  product(id: $id, channel: $channel) {
    ...UCPCatalogProductFragment
  }
}
    fragment UCPCatalogProductFragment on Product {
  id
  name
  slug
  description
  category {
    name
    slug
  }
  media {
    alt
    url
    type
  }
  pricing {
    priceRange {
      start {
        gross {
          ...MoneyFragment
        }
      }
      stop {
        gross {
          ...MoneyFragment
        }
      }
    }
    priceRangeUndiscounted {
      start {
        gross {
          ...MoneyFragment
        }
      }
      stop {
        gross {
          ...MoneyFragment
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
          ...MoneyFragment
        }
      }
      priceUndiscounted {
        gross {
          ...MoneyFragment
        }
      }
    }
    quantityAvailable
    media {
      alt
      url
    }
    attributes {
      attribute {
        name
        slug
      }
      values {
        name
      }
    }
  }
  productType {
    variantAttributes {
      name
      slug
      choices(first: 50) {
        edges {
          node {
            name
          }
        }
      }
    }
  }
}
fragment MoneyFragment on Money {
  currency
  amount
}`) as unknown as TypedDocumentString<UcpCatalogProduct, UcpCatalogProductVariables>;
export const UcpCatalogSearchDocument = new TypedDocumentString(`
    query UCPCatalogSearch($first: Int!, $channel: String!, $search: String, $filter: ProductFilterInput, $after: String) {
  products(
    first: $first
    channel: $channel
    search: $search
    filter: $filter
    after: $after
    sortBy: {field: RANK, direction: DESC}
  ) {
    edges {
      node {
        ...UCPCatalogProductFragment
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
    fragment UCPCatalogProductFragment on Product {
  id
  name
  slug
  description
  category {
    name
    slug
  }
  media {
    alt
    url
    type
  }
  pricing {
    priceRange {
      start {
        gross {
          ...MoneyFragment
        }
      }
      stop {
        gross {
          ...MoneyFragment
        }
      }
    }
    priceRangeUndiscounted {
      start {
        gross {
          ...MoneyFragment
        }
      }
      stop {
        gross {
          ...MoneyFragment
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
          ...MoneyFragment
        }
      }
      priceUndiscounted {
        gross {
          ...MoneyFragment
        }
      }
    }
    quantityAvailable
    media {
      alt
      url
    }
    attributes {
      attribute {
        name
        slug
      }
      values {
        name
      }
    }
  }
  productType {
    variantAttributes {
      name
      slug
      choices(first: 50) {
        edges {
          node {
            name
          }
        }
      }
    }
  }
}
fragment MoneyFragment on Money {
  currency
  amount
}`) as unknown as TypedDocumentString<UcpCatalogSearch, UcpCatalogSearchVariables>;
export const UcpCheckoutSessionGetDocument = new TypedDocumentString(`
    query UCPCheckoutSessionGet($id: ID!, $languageCode: LanguageCodeEnum!, $countryCode: CountryCode = US, $thumbnailSize: Int = 128, $thumbnailFormat: ThumbnailFormatEnum = WEBP, $isMarketplaceEnabled: Boolean = false) {
  checkout(id: $id) {
    ...UCPCheckoutSessionFragment
  }
}
    fragment MoneyFragment on Money {
  currency
  amount
}
fragment UCPCheckoutSessionFragment on Checkout {
  ...CheckoutFragment
  channel {
    slug
  }
  buyer: metafield(key: "ucp.buyer.json")
  cancelled: metafield(key: "ucp.cancelled")
}
fragment CheckoutFragment on Checkout {
  id
  email
  displayGrossPrices
  discount {
    amount
    currency
  }
  voucherCode
  shippingMethods {
    __typename
    id
    name
    maximumDeliveryDays
    minimumDeliveryDays
    message
    price {
      amount
      currency
    }
  }
  shippingAddress {
    ...AddressFragment
  }
  billingAddress {
    ...AddressFragment
  }
  deliveryMethod {
    __typename
    ... on Warehouse {
      id
      name
    }
    ... on ShippingMethod {
      id
      name
    }
  }
  availablePaymentGateways {
    name
    id
    config {
      field
      value
    }
  }
  lines {
    ...CartLineFragment
  }
  totalPrice {
    ...TaxedMoneyFragment
  }
  subtotalPrice {
    ...TaxedMoneyFragment
  }
  shippingPrice {
    ...TaxedMoneyFragment
  }
  isShippingRequired
  authorizeStatus
  chargeStatus
  problems {
    ...CheckoutProblemsFragment
  }
}
fragment AddressFragment on Address {
  id
  city
  phone
  postalCode
  companyName
  cityArea
  streetAddress1
  streetAddress2
  countryArea
  country {
    country
    code
  }
  firstName
  lastName
  isDefaultShippingAddress
  isDefaultBillingAddress
}
fragment CartLineFragment on CheckoutLine {
  id
  quantity
  totalPrice {
    net {
      ...MoneyFragment
    }
    tax {
      ...MoneyFragment
    }
    gross {
      ...MoneyFragment
    }
  }
  undiscountedTotalPrice {
    amount
    currency
  }
  variant {
    id
    quantityAvailable(countryCode: $countryCode)
    quantityLimitPerCustomer
    name
    sku
    translation(languageCode: $languageCode) {
      name
    }
    media {
      url(size: $thumbnailSize, format: $thumbnailFormat)
      alt
    }
    selectionAttributes: attributes(variantSelection: VARIANT_SELECTION) {
      ...SelectionAttributeFragment
    }
    product {
      id
      slug
      thumbnail(size: $thumbnailSize, format: $thumbnailFormat) {
        alt
        url
      }
      name
      translation(languageCode: $languageCode) {
        name
      }
      vendorId: metafield(key: "vendor.id") @include(if: $isMarketplaceEnabled)
    }
    pricing {
      discount {
        ...TaxedMoneyFragment
      }
    }
  }
}
fragment SelectionAttributeFragment on SelectedAttribute {
  attribute {
    ...AttributeFragment
  }
  values {
    ...AttributeValueFragment
  }
}
fragment AttributeFragment on Attribute {
  slug
  inputType
  name
  translation(languageCode: $languageCode) {
    name
  }
}
fragment AttributeValueFragment on AttributeValue {
  slug
  name
  plainText
  richText
  boolean
  date
  dateTime
  reference
  value
  translation(languageCode: $languageCode) {
    name
    plainText
    richText
  }
  file {
    url
  }
}
fragment TaxedMoneyFragment on TaxedMoney {
  net {
    ...MoneyFragment
  }
  gross {
    ...MoneyFragment
  }
  tax {
    ...MoneyFragment
  }
}
fragment CheckoutProblemsFragment on CheckoutProblem {
  ... on CheckoutLineProblemInsufficientStock {
    __typename
    availableQuantity
    line {
      ...CartLineFragment
    }
  }
  ... on CheckoutLineProblemVariantNotAvailable {
    __typename
    line {
      ...CartLineFragment
    }
  }
}`) as unknown as TypedDocumentString<UcpCheckoutSessionGet, UcpCheckoutSessionGetVariables>;
export const UcpOrderGetDocument = new TypedDocumentString(`
    query UCPOrderGet($id: ID!) {
  order(id: $id) {
    ...UCPOrderFragment
  }
}
    fragment MoneyFragment on Money {
  currency
  amount
}
fragment AddressFragment on Address {
  id
  city
  phone
  postalCode
  companyName
  cityArea
  streetAddress1
  streetAddress2
  countryArea
  country {
    country
    code
  }
  firstName
  lastName
  isDefaultShippingAddress
  isDefaultBillingAddress
}
fragment TaxedMoneyFragment on TaxedMoney {
  net {
    ...MoneyFragment
  }
  gross {
    ...MoneyFragment
  }
  tax {
    ...MoneyFragment
  }
}
fragment UCPOrderFragment on Order {
  id
  checkoutId
  created
  status
  paymentStatus
  displayGrossPrices
  metadata {
    key
    value
  }
  fulfillments {
    id
    status
  }
  lines {
    id
    quantity
    quantityFulfilled
    productName
    variantName
    productVariantId
    discounts {
      total {
        ...MoneyFragment
      }
    }
    unitPrice {
      ...TaxedMoneyFragment
    }
    totalPrice {
      ...TaxedMoneyFragment
    }
  }
  shippingAddress {
    ...AddressFragment
  }
  billingAddress {
    ...AddressFragment
  }
}`) as unknown as TypedDocumentString<UcpOrderGet, UcpOrderGetVariables>;