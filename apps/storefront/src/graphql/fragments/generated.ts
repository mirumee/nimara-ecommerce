import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type MenuEventSubscriptionFragment_MenuCreated_menu_Menu = { slug: string };

export type MenuEventSubscriptionFragment_MenuDeleted_menu_Menu = { slug: string };

export type MenuEventSubscriptionFragment_MenuItemCreated_menuItem_MenuItem_menu_Menu = { slug: string };

export type MenuEventSubscriptionFragment_MenuItemCreated_menuItem_MenuItem = { menu: MenuEventSubscriptionFragment_MenuItemCreated_menuItem_MenuItem_menu_Menu };

export type MenuEventSubscriptionFragment_MenuItemDeleted_menuItem_MenuItem_menu_Menu = { slug: string };

export type MenuEventSubscriptionFragment_MenuItemDeleted_menuItem_MenuItem = { menu: MenuEventSubscriptionFragment_MenuItemDeleted_menuItem_MenuItem_menu_Menu };

export type MenuEventSubscriptionFragment_MenuItemUpdated_menuItem_MenuItem_menu_Menu = { slug: string };

export type MenuEventSubscriptionFragment_MenuItemUpdated_menuItem_MenuItem = { menu: MenuEventSubscriptionFragment_MenuItemUpdated_menuItem_MenuItem_menu_Menu };

export type MenuEventSubscriptionFragment_MenuUpdated_menu_Menu = { slug: string };

export type MenuEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s = { __typename: 'AccountChangeEmailRequested' | 'AccountConfirmationRequested' | 'AccountConfirmed' | 'AccountDeleteRequested' | 'AccountDeleted' | 'AccountEmailChanged' | 'AccountSetPasswordRequested' | 'AddressCreated' | 'AddressDeleted' | 'AddressUpdated' | 'AppDeleted' | 'AppInstalled' | 'AppStatusChanged' | 'AppUpdated' | 'AttributeCreated' | 'AttributeDeleted' | 'AttributeUpdated' | 'AttributeValueCreated' | 'AttributeValueDeleted' | 'AttributeValueUpdated' };

export type MenuEventSubscriptionFragment_QJpVopnj9tAw174uVjo0KxVhwcLOzKKnfYk3kiIjlRi = { __typename: 'CalculateTaxes' | 'CategoryCreated' | 'CategoryDeleted' | 'CategoryUpdated' | 'ChannelCreated' | 'ChannelDeleted' | 'ChannelMetadataUpdated' | 'ChannelStatusChanged' | 'ChannelUpdated' | 'CheckoutCreated' | 'CheckoutFilterShippingMethods' | 'CheckoutFullyPaid' | 'CheckoutMetadataUpdated' | 'CheckoutUpdated' | 'CollectionCreated' | 'CollectionDeleted' | 'CollectionMetadataUpdated' | 'CollectionUpdated' | 'CustomerCreated' | 'CustomerMetadataUpdated' };

export type MenuEventSubscriptionFragment_JmEtZQo0d9WfwXdErwExR3cyw1iBd2N3dSKfWlpIxc = { __typename: 'CustomerUpdated' | 'DraftOrderCreated' | 'DraftOrderDeleted' | 'DraftOrderUpdated' | 'FulfillmentApproved' | 'FulfillmentCanceled' | 'FulfillmentCreated' | 'FulfillmentMetadataUpdated' | 'FulfillmentTrackingNumberUpdated' | 'GiftCardCreated' | 'GiftCardDeleted' | 'GiftCardExportCompleted' | 'GiftCardMetadataUpdated' | 'GiftCardSent' | 'GiftCardStatusChanged' | 'GiftCardUpdated' | 'InvoiceDeleted' | 'InvoiceRequested' | 'InvoiceSent' | 'ListStoredPaymentMethods' };

export type MenuEventSubscriptionFragment_YPBc8Fb7zCwJHzmQq3eEe6vg8QVjucSZas0RkBvRw = { __typename: 'OrderBulkCreated' | 'OrderCancelled' | 'OrderConfirmed' | 'OrderCreated' | 'OrderExpired' | 'OrderFilterShippingMethods' | 'OrderFulfilled' | 'OrderFullyPaid' | 'OrderFullyRefunded' | 'OrderMetadataUpdated' | 'OrderPaid' | 'OrderRefunded' | 'OrderUpdated' | 'PageCreated' | 'PageDeleted' | 'PageTypeCreated' | 'PageTypeDeleted' | 'PageTypeUpdated' | 'PageUpdated' | 'PaymentAuthorize' };

export type MenuEventSubscriptionFragment_HezzdL7zxss93HwVi8tlZ0cHDsAaHlrfWxRRlz93Zzk = { __typename: 'PaymentCaptureEvent' | 'PaymentConfirmEvent' | 'PaymentGatewayInitializeSession' | 'PaymentGatewayInitializeTokenizationSession' | 'PaymentListGateways' | 'PaymentMethodInitializeTokenizationSession' | 'PaymentMethodProcessTokenizationSession' | 'PaymentProcessEvent' | 'PaymentRefundEvent' | 'PaymentVoidEvent' | 'PermissionGroupCreated' | 'PermissionGroupDeleted' | 'PermissionGroupUpdated' | 'ProductCreated' | 'ProductDeleted' | 'ProductExportCompleted' | 'ProductMediaCreated' | 'ProductMediaDeleted' | 'ProductMediaUpdated' | 'ProductMetadataUpdated' };

export type MenuEventSubscriptionFragment_3wM2nJglZysZqyXe2PXv7dgg5ra3r2CqLh0G03sc = { __typename: 'ProductUpdated' | 'ProductVariantBackInStock' | 'ProductVariantCreated' | 'ProductVariantDeleted' | 'ProductVariantMetadataUpdated' | 'ProductVariantOutOfStock' | 'ProductVariantStockUpdated' | 'ProductVariantUpdated' | 'PromotionCreated' | 'PromotionDeleted' | 'PromotionEnded' | 'PromotionRuleCreated' | 'PromotionRuleDeleted' | 'PromotionRuleUpdated' | 'PromotionStarted' | 'PromotionUpdated' | 'SaleCreated' | 'SaleDeleted' | 'SaleToggle' | 'SaleUpdated' };

export type MenuEventSubscriptionFragment_C3zANrKmQj4BCk0zTQanbiWn8nIAzXKzJqHd4o3iO4 = { __typename: 'ShippingListMethodsForCheckout' | 'ShippingPriceCreated' | 'ShippingPriceDeleted' | 'ShippingPriceUpdated' | 'ShippingZoneCreated' | 'ShippingZoneDeleted' | 'ShippingZoneMetadataUpdated' | 'ShippingZoneUpdated' | 'ShopMetadataUpdated' | 'StaffCreated' | 'StaffDeleted' | 'StaffSetPasswordRequested' | 'StaffUpdated' | 'StoredPaymentMethodDeleteRequested' | 'ThumbnailCreated' | 'TransactionCancelationRequested' | 'TransactionChargeRequested' | 'TransactionInitializeSession' | 'TransactionItemMetadataUpdated' | 'TransactionProcessSession' };

export type MenuEventSubscriptionFragment_6nSTrout1sXuRsQxm391yzMyp6EmS8Np4Fh4jhvgns = { __typename: 'TransactionRefundRequested' | 'TranslationCreated' | 'TranslationUpdated' | 'VoucherCodeExportCompleted' | 'VoucherCodesCreated' | 'VoucherCodesDeleted' | 'VoucherCreated' | 'VoucherDeleted' | 'VoucherMetadataUpdated' | 'VoucherUpdated' | 'WarehouseCreated' | 'WarehouseDeleted' | 'WarehouseMetadataUpdated' | 'WarehouseUpdated' };

export type MenuEventSubscriptionFragment_MenuCreated = (
  { menu: MenuEventSubscriptionFragment_MenuCreated_menu_Menu | null }
  & { __typename: 'MenuCreated' }
);

export type MenuEventSubscriptionFragment_MenuDeleted = (
  { menu: MenuEventSubscriptionFragment_MenuDeleted_menu_Menu | null }
  & { __typename: 'MenuDeleted' }
);

export type MenuEventSubscriptionFragment_MenuItemCreated = (
  { menuItem: MenuEventSubscriptionFragment_MenuItemCreated_menuItem_MenuItem | null }
  & { __typename: 'MenuItemCreated' }
);

export type MenuEventSubscriptionFragment_MenuItemDeleted = (
  { menuItem: MenuEventSubscriptionFragment_MenuItemDeleted_menuItem_MenuItem | null }
  & { __typename: 'MenuItemDeleted' }
);

export type MenuEventSubscriptionFragment_MenuItemUpdated = (
  { menuItem: MenuEventSubscriptionFragment_MenuItemUpdated_menuItem_MenuItem | null }
  & { __typename: 'MenuItemUpdated' }
);

export type MenuEventSubscriptionFragment_MenuUpdated = (
  { menu: MenuEventSubscriptionFragment_MenuUpdated_menu_Menu | null }
  & { __typename: 'MenuUpdated' }
);

export type MenuEventSubscriptionFragment = MenuEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s | MenuEventSubscriptionFragment_QJpVopnj9tAw174uVjo0KxVhwcLOzKKnfYk3kiIjlRi | MenuEventSubscriptionFragment_JmEtZQo0d9WfwXdErwExR3cyw1iBd2N3dSKfWlpIxc | MenuEventSubscriptionFragment_YPBc8Fb7zCwJHzmQq3eEe6vg8QVjucSZas0RkBvRw | MenuEventSubscriptionFragment_HezzdL7zxss93HwVi8tlZ0cHDsAaHlrfWxRRlz93Zzk | MenuEventSubscriptionFragment_3wM2nJglZysZqyXe2PXv7dgg5ra3r2CqLh0G03sc | MenuEventSubscriptionFragment_C3zANrKmQj4BCk0zTQanbiWn8nIAzXKzJqHd4o3iO4 | MenuEventSubscriptionFragment_6nSTrout1sXuRsQxm391yzMyp6EmS8Np4Fh4jhvgns | MenuEventSubscriptionFragment_MenuCreated | MenuEventSubscriptionFragment_MenuDeleted | MenuEventSubscriptionFragment_MenuItemCreated | MenuEventSubscriptionFragment_MenuItemDeleted | MenuEventSubscriptionFragment_MenuItemUpdated | MenuEventSubscriptionFragment_MenuUpdated;

export type Money = { currency: string, amount: number };

export type PageEventSubscriptionFragment_PageCreated_page_Page = { slug: string };

export type PageEventSubscriptionFragment_PageDeleted_page_Page = { slug: string };

export type PageEventSubscriptionFragment_PageTypeCreated_pageType_PageType = { slug: string };

export type PageEventSubscriptionFragment_PageTypeDeleted_pageType_PageType = { slug: string };

export type PageEventSubscriptionFragment_PageTypeUpdated_pageType_PageType = { slug: string };

export type PageEventSubscriptionFragment_PageUpdated_page_Page = { slug: string };

export type PageEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s = { __typename: 'AccountChangeEmailRequested' | 'AccountConfirmationRequested' | 'AccountConfirmed' | 'AccountDeleteRequested' | 'AccountDeleted' | 'AccountEmailChanged' | 'AccountSetPasswordRequested' | 'AddressCreated' | 'AddressDeleted' | 'AddressUpdated' | 'AppDeleted' | 'AppInstalled' | 'AppStatusChanged' | 'AppUpdated' | 'AttributeCreated' | 'AttributeDeleted' | 'AttributeUpdated' | 'AttributeValueCreated' | 'AttributeValueDeleted' | 'AttributeValueUpdated' };

export type PageEventSubscriptionFragment_QJpVopnj9tAw174uVjo0KxVhwcLOzKKnfYk3kiIjlRi = { __typename: 'CalculateTaxes' | 'CategoryCreated' | 'CategoryDeleted' | 'CategoryUpdated' | 'ChannelCreated' | 'ChannelDeleted' | 'ChannelMetadataUpdated' | 'ChannelStatusChanged' | 'ChannelUpdated' | 'CheckoutCreated' | 'CheckoutFilterShippingMethods' | 'CheckoutFullyPaid' | 'CheckoutMetadataUpdated' | 'CheckoutUpdated' | 'CollectionCreated' | 'CollectionDeleted' | 'CollectionMetadataUpdated' | 'CollectionUpdated' | 'CustomerCreated' | 'CustomerMetadataUpdated' };

export type PageEventSubscriptionFragment_JmEtZQo0d9WfwXdErwExR3cyw1iBd2N3dSKfWlpIxc = { __typename: 'CustomerUpdated' | 'DraftOrderCreated' | 'DraftOrderDeleted' | 'DraftOrderUpdated' | 'FulfillmentApproved' | 'FulfillmentCanceled' | 'FulfillmentCreated' | 'FulfillmentMetadataUpdated' | 'FulfillmentTrackingNumberUpdated' | 'GiftCardCreated' | 'GiftCardDeleted' | 'GiftCardExportCompleted' | 'GiftCardMetadataUpdated' | 'GiftCardSent' | 'GiftCardStatusChanged' | 'GiftCardUpdated' | 'InvoiceDeleted' | 'InvoiceRequested' | 'InvoiceSent' | 'ListStoredPaymentMethods' };

export type PageEventSubscriptionFragment_ScBspfyBrxPcHRwpBe5ZtJu4sXvFlHuN0Vv5mTMah4 = { __typename: 'MenuCreated' | 'MenuDeleted' | 'MenuItemCreated' | 'MenuItemDeleted' | 'MenuItemUpdated' | 'MenuUpdated' | 'OrderBulkCreated' | 'OrderCancelled' | 'OrderConfirmed' | 'OrderCreated' | 'OrderExpired' | 'OrderFilterShippingMethods' | 'OrderFulfilled' | 'OrderFullyPaid' | 'OrderFullyRefunded' | 'OrderMetadataUpdated' | 'OrderPaid' | 'OrderRefunded' | 'OrderUpdated' | 'PaymentAuthorize' };

export type PageEventSubscriptionFragment_HezzdL7zxss93HwVi8tlZ0cHDsAaHlrfWxRRlz93Zzk = { __typename: 'PaymentCaptureEvent' | 'PaymentConfirmEvent' | 'PaymentGatewayInitializeSession' | 'PaymentGatewayInitializeTokenizationSession' | 'PaymentListGateways' | 'PaymentMethodInitializeTokenizationSession' | 'PaymentMethodProcessTokenizationSession' | 'PaymentProcessEvent' | 'PaymentRefundEvent' | 'PaymentVoidEvent' | 'PermissionGroupCreated' | 'PermissionGroupDeleted' | 'PermissionGroupUpdated' | 'ProductCreated' | 'ProductDeleted' | 'ProductExportCompleted' | 'ProductMediaCreated' | 'ProductMediaDeleted' | 'ProductMediaUpdated' | 'ProductMetadataUpdated' };

export type PageEventSubscriptionFragment_3wM2nJglZysZqyXe2PXv7dgg5ra3r2CqLh0G03sc = { __typename: 'ProductUpdated' | 'ProductVariantBackInStock' | 'ProductVariantCreated' | 'ProductVariantDeleted' | 'ProductVariantMetadataUpdated' | 'ProductVariantOutOfStock' | 'ProductVariantStockUpdated' | 'ProductVariantUpdated' | 'PromotionCreated' | 'PromotionDeleted' | 'PromotionEnded' | 'PromotionRuleCreated' | 'PromotionRuleDeleted' | 'PromotionRuleUpdated' | 'PromotionStarted' | 'PromotionUpdated' | 'SaleCreated' | 'SaleDeleted' | 'SaleToggle' | 'SaleUpdated' };

export type PageEventSubscriptionFragment_C3zANrKmQj4BCk0zTQanbiWn8nIAzXKzJqHd4o3iO4 = { __typename: 'ShippingListMethodsForCheckout' | 'ShippingPriceCreated' | 'ShippingPriceDeleted' | 'ShippingPriceUpdated' | 'ShippingZoneCreated' | 'ShippingZoneDeleted' | 'ShippingZoneMetadataUpdated' | 'ShippingZoneUpdated' | 'ShopMetadataUpdated' | 'StaffCreated' | 'StaffDeleted' | 'StaffSetPasswordRequested' | 'StaffUpdated' | 'StoredPaymentMethodDeleteRequested' | 'ThumbnailCreated' | 'TransactionCancelationRequested' | 'TransactionChargeRequested' | 'TransactionInitializeSession' | 'TransactionItemMetadataUpdated' | 'TransactionProcessSession' };

export type PageEventSubscriptionFragment_6nSTrout1sXuRsQxm391yzMyp6EmS8Np4Fh4jhvgns = { __typename: 'TransactionRefundRequested' | 'TranslationCreated' | 'TranslationUpdated' | 'VoucherCodeExportCompleted' | 'VoucherCodesCreated' | 'VoucherCodesDeleted' | 'VoucherCreated' | 'VoucherDeleted' | 'VoucherMetadataUpdated' | 'VoucherUpdated' | 'WarehouseCreated' | 'WarehouseDeleted' | 'WarehouseMetadataUpdated' | 'WarehouseUpdated' };

export type PageEventSubscriptionFragment_PageCreated = (
  { page: PageEventSubscriptionFragment_PageCreated_page_Page | null }
  & { __typename: 'PageCreated' }
);

export type PageEventSubscriptionFragment_PageDeleted = (
  { page: PageEventSubscriptionFragment_PageDeleted_page_Page | null }
  & { __typename: 'PageDeleted' }
);

export type PageEventSubscriptionFragment_PageTypeCreated = (
  { pageType: PageEventSubscriptionFragment_PageTypeCreated_pageType_PageType | null }
  & { __typename: 'PageTypeCreated' }
);

export type PageEventSubscriptionFragment_PageTypeDeleted = (
  { pageType: PageEventSubscriptionFragment_PageTypeDeleted_pageType_PageType | null }
  & { __typename: 'PageTypeDeleted' }
);

export type PageEventSubscriptionFragment_PageTypeUpdated = (
  { pageType: PageEventSubscriptionFragment_PageTypeUpdated_pageType_PageType | null }
  & { __typename: 'PageTypeUpdated' }
);

export type PageEventSubscriptionFragment_PageUpdated = (
  { page: PageEventSubscriptionFragment_PageUpdated_page_Page | null }
  & { __typename: 'PageUpdated' }
);

export type PageEventSubscriptionFragment = PageEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s | PageEventSubscriptionFragment_QJpVopnj9tAw174uVjo0KxVhwcLOzKKnfYk3kiIjlRi | PageEventSubscriptionFragment_JmEtZQo0d9WfwXdErwExR3cyw1iBd2N3dSKfWlpIxc | PageEventSubscriptionFragment_ScBspfyBrxPcHRwpBe5ZtJu4sXvFlHuN0Vv5mTMah4 | PageEventSubscriptionFragment_HezzdL7zxss93HwVi8tlZ0cHDsAaHlrfWxRRlz93Zzk | PageEventSubscriptionFragment_3wM2nJglZysZqyXe2PXv7dgg5ra3r2CqLh0G03sc | PageEventSubscriptionFragment_C3zANrKmQj4BCk0zTQanbiWn8nIAzXKzJqHd4o3iO4 | PageEventSubscriptionFragment_6nSTrout1sXuRsQxm391yzMyp6EmS8Np4Fh4jhvgns | PageEventSubscriptionFragment_PageCreated | PageEventSubscriptionFragment_PageDeleted | PageEventSubscriptionFragment_PageTypeCreated | PageEventSubscriptionFragment_PageTypeDeleted | PageEventSubscriptionFragment_PageTypeUpdated | PageEventSubscriptionFragment_PageUpdated;

export type ProductEventSubscriptionFragment_ProductDeleted_product_Product = { slug: string };

export type ProductEventSubscriptionFragment_ProductMediaCreated_productMedia_ProductMedia = { productId: string | null };

export type ProductEventSubscriptionFragment_ProductMediaDeleted_productMedia_ProductMedia = { productId: string | null };

export type ProductEventSubscriptionFragment_ProductMediaUpdated_productMedia_ProductMedia = { productId: string | null };

export type ProductEventSubscriptionFragment_ProductMetadataUpdated_product_Product = { slug: string };

export type ProductEventSubscriptionFragment_ProductUpdated_product_Product = { slug: string };

export type ProductEventSubscriptionFragment_ProductVariantBackInStock_productVariant_ProductVariant_product_Product = { slug: string };

export type ProductEventSubscriptionFragment_ProductVariantBackInStock_productVariant_ProductVariant = { product: ProductEventSubscriptionFragment_ProductVariantBackInStock_productVariant_ProductVariant_product_Product };

export type ProductEventSubscriptionFragment_ProductVariantCreated_productVariant_ProductVariant_product_Product = { slug: string };

export type ProductEventSubscriptionFragment_ProductVariantCreated_productVariant_ProductVariant = { product: ProductEventSubscriptionFragment_ProductVariantCreated_productVariant_ProductVariant_product_Product };

export type ProductEventSubscriptionFragment_ProductVariantDeleted_productVariant_ProductVariant_product_Product = { slug: string };

export type ProductEventSubscriptionFragment_ProductVariantDeleted_productVariant_ProductVariant = { product: ProductEventSubscriptionFragment_ProductVariantDeleted_productVariant_ProductVariant_product_Product };

export type ProductEventSubscriptionFragment_ProductVariantMetadataUpdated_productVariant_ProductVariant_product_Product = { slug: string };

export type ProductEventSubscriptionFragment_ProductVariantMetadataUpdated_productVariant_ProductVariant = { product: ProductEventSubscriptionFragment_ProductVariantMetadataUpdated_productVariant_ProductVariant_product_Product };

export type ProductEventSubscriptionFragment_ProductVariantOutOfStock_productVariant_ProductVariant_product_Product = { slug: string };

export type ProductEventSubscriptionFragment_ProductVariantOutOfStock_productVariant_ProductVariant = { product: ProductEventSubscriptionFragment_ProductVariantOutOfStock_productVariant_ProductVariant_product_Product };

export type ProductEventSubscriptionFragment_ProductVariantStockUpdated_productVariant_ProductVariant_product_Product = { slug: string };

export type ProductEventSubscriptionFragment_ProductVariantStockUpdated_productVariant_ProductVariant = { product: ProductEventSubscriptionFragment_ProductVariantStockUpdated_productVariant_ProductVariant_product_Product };

export type ProductEventSubscriptionFragment_ProductVariantUpdated_productVariant_ProductVariant_product_Product = { slug: string };

export type ProductEventSubscriptionFragment_ProductVariantUpdated_productVariant_ProductVariant = { product: ProductEventSubscriptionFragment_ProductVariantUpdated_productVariant_ProductVariant_product_Product };

export type ProductEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s = { __typename: 'AccountChangeEmailRequested' | 'AccountConfirmationRequested' | 'AccountConfirmed' | 'AccountDeleteRequested' | 'AccountDeleted' | 'AccountEmailChanged' | 'AccountSetPasswordRequested' | 'AddressCreated' | 'AddressDeleted' | 'AddressUpdated' | 'AppDeleted' | 'AppInstalled' | 'AppStatusChanged' | 'AppUpdated' | 'AttributeCreated' | 'AttributeDeleted' | 'AttributeUpdated' | 'AttributeValueCreated' | 'AttributeValueDeleted' | 'AttributeValueUpdated' };

export type ProductEventSubscriptionFragment_QJpVopnj9tAw174uVjo0KxVhwcLOzKKnfYk3kiIjlRi = { __typename: 'CalculateTaxes' | 'CategoryCreated' | 'CategoryDeleted' | 'CategoryUpdated' | 'ChannelCreated' | 'ChannelDeleted' | 'ChannelMetadataUpdated' | 'ChannelStatusChanged' | 'ChannelUpdated' | 'CheckoutCreated' | 'CheckoutFilterShippingMethods' | 'CheckoutFullyPaid' | 'CheckoutMetadataUpdated' | 'CheckoutUpdated' | 'CollectionCreated' | 'CollectionDeleted' | 'CollectionMetadataUpdated' | 'CollectionUpdated' | 'CustomerCreated' | 'CustomerMetadataUpdated' };

export type ProductEventSubscriptionFragment_JmEtZQo0d9WfwXdErwExR3cyw1iBd2N3dSKfWlpIxc = { __typename: 'CustomerUpdated' | 'DraftOrderCreated' | 'DraftOrderDeleted' | 'DraftOrderUpdated' | 'FulfillmentApproved' | 'FulfillmentCanceled' | 'FulfillmentCreated' | 'FulfillmentMetadataUpdated' | 'FulfillmentTrackingNumberUpdated' | 'GiftCardCreated' | 'GiftCardDeleted' | 'GiftCardExportCompleted' | 'GiftCardMetadataUpdated' | 'GiftCardSent' | 'GiftCardStatusChanged' | 'GiftCardUpdated' | 'InvoiceDeleted' | 'InvoiceRequested' | 'InvoiceSent' | 'ListStoredPaymentMethods' };

export type ProductEventSubscriptionFragment_IIttyh9obOk2HiNzq9wRoe2KykonejXScLlZcpen38 = { __typename: 'MenuCreated' | 'MenuDeleted' | 'MenuItemCreated' | 'MenuItemDeleted' | 'MenuItemUpdated' | 'MenuUpdated' | 'OrderBulkCreated' | 'OrderCancelled' | 'OrderConfirmed' | 'OrderCreated' | 'OrderExpired' | 'OrderFilterShippingMethods' | 'OrderFulfilled' | 'OrderFullyPaid' | 'OrderFullyRefunded' | 'OrderMetadataUpdated' | 'OrderPaid' | 'OrderRefunded' | 'OrderUpdated' | 'PageCreated' };

export type ProductEventSubscriptionFragment_AH3BZpCszuOvBtBprYx65eaRIx5Joylb7Ve3GdBzgk = { __typename: 'PageDeleted' | 'PageTypeCreated' | 'PageTypeDeleted' | 'PageTypeUpdated' | 'PageUpdated' | 'PaymentAuthorize' | 'PaymentCaptureEvent' | 'PaymentConfirmEvent' | 'PaymentGatewayInitializeSession' | 'PaymentGatewayInitializeTokenizationSession' | 'PaymentListGateways' | 'PaymentMethodInitializeTokenizationSession' | 'PaymentMethodProcessTokenizationSession' | 'PaymentProcessEvent' | 'PaymentRefundEvent' | 'PaymentVoidEvent' | 'PermissionGroupCreated' | 'PermissionGroupDeleted' | 'PermissionGroupUpdated' | 'ProductCreated' };

export type ProductEventSubscriptionFragment_EvFnHgkX6P7pzjiB5OWndOnCyOuSi5d6jGRaXUcoA = { __typename: 'ProductExportCompleted' | 'PromotionCreated' | 'PromotionDeleted' | 'PromotionEnded' | 'PromotionRuleCreated' | 'PromotionRuleDeleted' | 'PromotionRuleUpdated' | 'PromotionStarted' | 'PromotionUpdated' | 'SaleCreated' | 'SaleDeleted' | 'SaleToggle' | 'SaleUpdated' | 'ShippingListMethodsForCheckout' | 'ShippingPriceCreated' | 'ShippingPriceDeleted' | 'ShippingPriceUpdated' | 'ShippingZoneCreated' | 'ShippingZoneDeleted' | 'ShippingZoneMetadataUpdated' };

export type ProductEventSubscriptionFragment_JHf7mHimOuDizDnHjb1xQ3HwEmj1W8kXDpiYpPrD2Fy = { __typename: 'ShippingZoneUpdated' | 'ShopMetadataUpdated' | 'StaffCreated' | 'StaffDeleted' | 'StaffSetPasswordRequested' | 'StaffUpdated' | 'StoredPaymentMethodDeleteRequested' | 'ThumbnailCreated' | 'TransactionCancelationRequested' | 'TransactionChargeRequested' | 'TransactionInitializeSession' | 'TransactionItemMetadataUpdated' | 'TransactionProcessSession' | 'TransactionRefundRequested' | 'TranslationCreated' | 'TranslationUpdated' | 'VoucherCodeExportCompleted' | 'VoucherCodesCreated' | 'VoucherCodesDeleted' | 'VoucherCreated' };

export type ProductEventSubscriptionFragment_31FaXgouTQcpsEbEj1GRkTibOhoDnUtWAnhJoBn6k = { __typename: 'VoucherDeleted' | 'VoucherMetadataUpdated' | 'VoucherUpdated' | 'WarehouseCreated' | 'WarehouseDeleted' | 'WarehouseMetadataUpdated' | 'WarehouseUpdated' };

export type ProductEventSubscriptionFragment_ProductDeleted = (
  { product: ProductEventSubscriptionFragment_ProductDeleted_product_Product | null }
  & { __typename: 'ProductDeleted' }
);

export type ProductEventSubscriptionFragment_ProductMediaCreated = (
  { productMedia: ProductEventSubscriptionFragment_ProductMediaCreated_productMedia_ProductMedia | null }
  & { __typename: 'ProductMediaCreated' }
);

export type ProductEventSubscriptionFragment_ProductMediaDeleted = (
  { productMedia: ProductEventSubscriptionFragment_ProductMediaDeleted_productMedia_ProductMedia | null }
  & { __typename: 'ProductMediaDeleted' }
);

export type ProductEventSubscriptionFragment_ProductMediaUpdated = (
  { productMedia: ProductEventSubscriptionFragment_ProductMediaUpdated_productMedia_ProductMedia | null }
  & { __typename: 'ProductMediaUpdated' }
);

export type ProductEventSubscriptionFragment_ProductMetadataUpdated = (
  { product: ProductEventSubscriptionFragment_ProductMetadataUpdated_product_Product | null }
  & { __typename: 'ProductMetadataUpdated' }
);

export type ProductEventSubscriptionFragment_ProductUpdated = (
  { product: ProductEventSubscriptionFragment_ProductUpdated_product_Product | null }
  & { __typename: 'ProductUpdated' }
);

export type ProductEventSubscriptionFragment_ProductVariantBackInStock = (
  { productVariant: ProductEventSubscriptionFragment_ProductVariantBackInStock_productVariant_ProductVariant | null }
  & { __typename: 'ProductVariantBackInStock' }
);

export type ProductEventSubscriptionFragment_ProductVariantCreated = (
  { productVariant: ProductEventSubscriptionFragment_ProductVariantCreated_productVariant_ProductVariant | null }
  & { __typename: 'ProductVariantCreated' }
);

export type ProductEventSubscriptionFragment_ProductVariantDeleted = (
  { productVariant: ProductEventSubscriptionFragment_ProductVariantDeleted_productVariant_ProductVariant | null }
  & { __typename: 'ProductVariantDeleted' }
);

export type ProductEventSubscriptionFragment_ProductVariantMetadataUpdated = (
  { productVariant: ProductEventSubscriptionFragment_ProductVariantMetadataUpdated_productVariant_ProductVariant | null }
  & { __typename: 'ProductVariantMetadataUpdated' }
);

export type ProductEventSubscriptionFragment_ProductVariantOutOfStock = (
  { productVariant: ProductEventSubscriptionFragment_ProductVariantOutOfStock_productVariant_ProductVariant | null }
  & { __typename: 'ProductVariantOutOfStock' }
);

export type ProductEventSubscriptionFragment_ProductVariantStockUpdated = (
  { productVariant: ProductEventSubscriptionFragment_ProductVariantStockUpdated_productVariant_ProductVariant | null }
  & { __typename: 'ProductVariantStockUpdated' }
);

export type ProductEventSubscriptionFragment_ProductVariantUpdated = (
  { productVariant: ProductEventSubscriptionFragment_ProductVariantUpdated_productVariant_ProductVariant | null }
  & { __typename: 'ProductVariantUpdated' }
);

export type ProductEventSubscriptionFragment = ProductEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s | ProductEventSubscriptionFragment_QJpVopnj9tAw174uVjo0KxVhwcLOzKKnfYk3kiIjlRi | ProductEventSubscriptionFragment_JmEtZQo0d9WfwXdErwExR3cyw1iBd2N3dSKfWlpIxc | ProductEventSubscriptionFragment_IIttyh9obOk2HiNzq9wRoe2KykonejXScLlZcpen38 | ProductEventSubscriptionFragment_AH3BZpCszuOvBtBprYx65eaRIx5Joylb7Ve3GdBzgk | ProductEventSubscriptionFragment_EvFnHgkX6P7pzjiB5OWndOnCyOuSi5d6jGRaXUcoA | ProductEventSubscriptionFragment_JHf7mHimOuDizDnHjb1xQ3HwEmj1W8kXDpiYpPrD2Fy | ProductEventSubscriptionFragment_31FaXgouTQcpsEbEj1GRkTibOhoDnUtWAnhJoBn6k | ProductEventSubscriptionFragment_ProductDeleted | ProductEventSubscriptionFragment_ProductMediaCreated | ProductEventSubscriptionFragment_ProductMediaDeleted | ProductEventSubscriptionFragment_ProductMediaUpdated | ProductEventSubscriptionFragment_ProductMetadataUpdated | ProductEventSubscriptionFragment_ProductUpdated | ProductEventSubscriptionFragment_ProductVariantBackInStock | ProductEventSubscriptionFragment_ProductVariantCreated | ProductEventSubscriptionFragment_ProductVariantDeleted | ProductEventSubscriptionFragment_ProductVariantMetadataUpdated | ProductEventSubscriptionFragment_ProductVariantOutOfStock | ProductEventSubscriptionFragment_ProductVariantStockUpdated | ProductEventSubscriptionFragment_ProductVariantUpdated;

export type TaxedMoney_TaxedMoney_net_Money = { currency: string, amount: number };

export type TaxedMoney_TaxedMoney_gross_Money = { currency: string, amount: number };

export type TaxedMoney_TaxedMoney_tax_Money = { currency: string, amount: number };

export type TaxedMoney = { net: TaxedMoney_TaxedMoney_net_Money, gross: TaxedMoney_TaxedMoney_gross_Money, tax: TaxedMoney_TaxedMoney_tax_Money };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];

  constructor(private value: string, public __meta__?: Record<string, any>) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const MenuEventSubscriptionFragment = new TypedDocumentString(`
    fragment MenuEventSubscriptionFragment on Event {
  __typename
  ... on MenuCreated {
    menu {
      slug
    }
  }
  ... on MenuUpdated {
    menu {
      slug
    }
  }
  ... on MenuDeleted {
    menu {
      slug
    }
  }
  ... on MenuItemCreated {
    menuItem {
      menu {
        slug
      }
    }
  }
  ... on MenuItemUpdated {
    menuItem {
      menu {
        slug
      }
    }
  }
  ... on MenuItemDeleted {
    menuItem {
      menu {
        slug
      }
    }
  }
}
    `, {"fragmentName":"MenuEventSubscriptionFragment"}) as unknown as TypedDocumentString<MenuEventSubscriptionFragment, unknown>;
export const PageEventSubscriptionFragment = new TypedDocumentString(`
    fragment PageEventSubscriptionFragment on Event {
  __typename
  ... on PageCreated {
    page {
      slug
    }
  }
  ... on PageDeleted {
    page {
      slug
    }
  }
  ... on PageUpdated {
    page {
      slug
    }
  }
  ... on PageTypeCreated {
    pageType {
      slug
    }
  }
  ... on PageTypeDeleted {
    pageType {
      slug
    }
  }
  ... on PageTypeUpdated {
    pageType {
      slug
    }
  }
}
    `, {"fragmentName":"PageEventSubscriptionFragment"}) as unknown as TypedDocumentString<PageEventSubscriptionFragment, unknown>;
export const ProductEventSubscriptionFragment = new TypedDocumentString(`
    fragment ProductEventSubscriptionFragment on Event {
  __typename
  ... on ProductUpdated {
    product {
      slug
    }
  }
  ... on ProductDeleted {
    product {
      slug
    }
  }
  ... on ProductMetadataUpdated {
    product {
      slug
    }
  }
  ... on ProductMediaDeleted {
    productMedia {
      productId
    }
  }
  ... on ProductMediaUpdated {
    productMedia {
      productId
    }
  }
  ... on ProductMediaCreated {
    productMedia {
      productId
    }
  }
  ... on ProductVariantUpdated {
    productVariant {
      product {
        slug
      }
    }
  }
  ... on ProductVariantCreated {
    productVariant {
      product {
        slug
      }
    }
  }
  ... on ProductVariantDeleted {
    productVariant {
      product {
        slug
      }
    }
  }
  ... on ProductVariantBackInStock {
    productVariant {
      product {
        slug
      }
    }
  }
  ... on ProductVariantOutOfStock {
    productVariant {
      product {
        slug
      }
    }
  }
  ... on ProductVariantMetadataUpdated {
    productVariant {
      product {
        slug
      }
    }
  }
  ... on ProductVariantStockUpdated {
    productVariant {
      product {
        slug
      }
    }
  }
}
    `, {"fragmentName":"ProductEventSubscriptionFragment"}) as unknown as TypedDocumentString<ProductEventSubscriptionFragment, unknown>;
export const TaxedMoney = new TypedDocumentString(`
    fragment TaxedMoney on TaxedMoney {
  net {
    ...Money
  }
  gross {
    ...Money
  }
  tax {
    ...Money
  }
}
    fragment Money on Money {
  currency
  amount
}`, {"fragmentName":"TaxedMoney"}) as unknown as TypedDocumentString<TaxedMoney, unknown>;