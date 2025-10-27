import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CollectionEventSubscriptionFragment_CollectionCreated_collection_Collection = { slug: string };

export type CollectionEventSubscriptionFragment_CollectionDeleted_collection_Collection = { slug: string };

export type CollectionEventSubscriptionFragment_CollectionUpdated_collection_Collection = { slug: string };

export type CollectionEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s = { __typename: 'AccountChangeEmailRequested' | 'AccountConfirmationRequested' | 'AccountConfirmed' | 'AccountDeleteRequested' | 'AccountDeleted' | 'AccountEmailChanged' | 'AccountSetPasswordRequested' | 'AddressCreated' | 'AddressDeleted' | 'AddressUpdated' | 'AppDeleted' | 'AppInstalled' | 'AppStatusChanged' | 'AppUpdated' | 'AttributeCreated' | 'AttributeDeleted' | 'AttributeUpdated' | 'AttributeValueCreated' | 'AttributeValueDeleted' | 'AttributeValueUpdated' };

export type CollectionEventSubscriptionFragment_CzhsL0SidO8kHy4oJaew82VKc1ufy6vKqNceVhHk = { __typename: 'CalculateTaxes' | 'CategoryCreated' | 'CategoryDeleted' | 'CategoryUpdated' | 'ChannelCreated' | 'ChannelDeleted' | 'ChannelMetadataUpdated' | 'ChannelStatusChanged' | 'ChannelUpdated' | 'CheckoutCreated' | 'CheckoutFilterShippingMethods' | 'CheckoutFullyPaid' | 'CheckoutMetadataUpdated' | 'CheckoutUpdated' | 'CollectionMetadataUpdated' | 'CustomerCreated' | 'CustomerMetadataUpdated' | 'CustomerUpdated' | 'DraftOrderCreated' | 'DraftOrderDeleted' };

export type CollectionEventSubscriptionFragment_WzQq7Npnuzmjn1PdNjYyZcpZqWXwdnZm8znImmvn8 = { __typename: 'DraftOrderUpdated' | 'FulfillmentApproved' | 'FulfillmentCanceled' | 'FulfillmentCreated' | 'FulfillmentMetadataUpdated' | 'FulfillmentTrackingNumberUpdated' | 'GiftCardCreated' | 'GiftCardDeleted' | 'GiftCardExportCompleted' | 'GiftCardMetadataUpdated' | 'GiftCardSent' | 'GiftCardStatusChanged' | 'GiftCardUpdated' | 'InvoiceDeleted' | 'InvoiceRequested' | 'InvoiceSent' | 'ListStoredPaymentMethods' | 'MenuCreated' | 'MenuDeleted' | 'MenuItemCreated' };

export type CollectionEventSubscriptionFragment_FMnxs1aye0mJYcGjjaPMcg1Kgr1Xql3m9Rjm6Js = { __typename: 'MenuItemDeleted' | 'MenuItemUpdated' | 'MenuUpdated' | 'OrderBulkCreated' | 'OrderCancelled' | 'OrderConfirmed' | 'OrderCreated' | 'OrderExpired' | 'OrderFilterShippingMethods' | 'OrderFulfilled' | 'OrderFullyPaid' | 'OrderFullyRefunded' | 'OrderMetadataUpdated' | 'OrderPaid' | 'OrderRefunded' | 'OrderUpdated' | 'PageCreated' | 'PageDeleted' | 'PageTypeCreated' | 'PageTypeDeleted' };

export type CollectionEventSubscriptionFragment_IWiod6Pe9UWcwlGd7Kr16Wu6XseBvuPKzPmKIoFq = { __typename: 'PageTypeUpdated' | 'PageUpdated' | 'PaymentAuthorize' | 'PaymentCaptureEvent' | 'PaymentConfirmEvent' | 'PaymentGatewayInitializeSession' | 'PaymentGatewayInitializeTokenizationSession' | 'PaymentListGateways' | 'PaymentMethodInitializeTokenizationSession' | 'PaymentMethodProcessTokenizationSession' | 'PaymentProcessEvent' | 'PaymentRefundEvent' | 'PaymentVoidEvent' | 'PermissionGroupCreated' | 'PermissionGroupDeleted' | 'PermissionGroupUpdated' | 'ProductCreated' | 'ProductDeleted' | 'ProductExportCompleted' | 'ProductMediaCreated' };

export type CollectionEventSubscriptionFragment_YWsPRq34uGfcntNhW1ztfG7H7yNcw2tgk4U6iloSq = { __typename: 'ProductMediaDeleted' | 'ProductMediaUpdated' | 'ProductMetadataUpdated' | 'ProductUpdated' | 'ProductVariantBackInStock' | 'ProductVariantCreated' | 'ProductVariantDeleted' | 'ProductVariantMetadataUpdated' | 'ProductVariantOutOfStock' | 'ProductVariantStockUpdated' | 'ProductVariantUpdated' | 'PromotionCreated' | 'PromotionDeleted' | 'PromotionEnded' | 'PromotionRuleCreated' | 'PromotionRuleDeleted' | 'PromotionRuleUpdated' | 'PromotionStarted' | 'PromotionUpdated' | 'SaleCreated' };

export type CollectionEventSubscriptionFragment_DrUkVlJ6A58NipwMeda6M6a5gg2xrC0NYxXrGt0k = { __typename: 'SaleDeleted' | 'SaleToggle' | 'SaleUpdated' | 'ShippingListMethodsForCheckout' | 'ShippingPriceCreated' | 'ShippingPriceDeleted' | 'ShippingPriceUpdated' | 'ShippingZoneCreated' | 'ShippingZoneDeleted' | 'ShippingZoneMetadataUpdated' | 'ShippingZoneUpdated' | 'ShopMetadataUpdated' | 'StaffCreated' | 'StaffDeleted' | 'StaffSetPasswordRequested' | 'StaffUpdated' | 'StoredPaymentMethodDeleteRequested' | 'ThumbnailCreated' | 'TransactionCancelationRequested' | 'TransactionChargeRequested' };

export type CollectionEventSubscriptionFragment_SeO7B6XBhR0QlD4FKr6LLnhZjlrWp4jJi5XGkSaEadu = { __typename: 'TransactionInitializeSession' | 'TransactionItemMetadataUpdated' | 'TransactionProcessSession' | 'TransactionRefundRequested' | 'TranslationCreated' | 'TranslationUpdated' | 'VoucherCodeExportCompleted' | 'VoucherCodesCreated' | 'VoucherCodesDeleted' | 'VoucherCreated' | 'VoucherDeleted' | 'VoucherMetadataUpdated' | 'VoucherUpdated' | 'WarehouseCreated' | 'WarehouseDeleted' | 'WarehouseMetadataUpdated' | 'WarehouseUpdated' };

export type CollectionEventSubscriptionFragment_CollectionCreated = (
  { collection: CollectionEventSubscriptionFragment_CollectionCreated_collection_Collection | null }
  & { __typename: 'CollectionCreated' }
);

export type CollectionEventSubscriptionFragment_CollectionDeleted = (
  { collection: CollectionEventSubscriptionFragment_CollectionDeleted_collection_Collection | null }
  & { __typename: 'CollectionDeleted' }
);

export type CollectionEventSubscriptionFragment_CollectionUpdated = (
  { collection: CollectionEventSubscriptionFragment_CollectionUpdated_collection_Collection | null }
  & { __typename: 'CollectionUpdated' }
);

export type CollectionEventSubscriptionFragment = CollectionEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s | CollectionEventSubscriptionFragment_CzhsL0SidO8kHy4oJaew82VKc1ufy6vKqNceVhHk | CollectionEventSubscriptionFragment_WzQq7Npnuzmjn1PdNjYyZcpZqWXwdnZm8znImmvn8 | CollectionEventSubscriptionFragment_FMnxs1aye0mJYcGjjaPMcg1Kgr1Xql3m9Rjm6Js | CollectionEventSubscriptionFragment_IWiod6Pe9UWcwlGd7Kr16Wu6XseBvuPKzPmKIoFq | CollectionEventSubscriptionFragment_YWsPRq34uGfcntNhW1ztfG7H7yNcw2tgk4U6iloSq | CollectionEventSubscriptionFragment_DrUkVlJ6A58NipwMeda6M6a5gg2xrC0NYxXrGt0k | CollectionEventSubscriptionFragment_SeO7B6XBhR0QlD4FKr6LLnhZjlrWp4jJi5XGkSaEadu | CollectionEventSubscriptionFragment_CollectionCreated | CollectionEventSubscriptionFragment_CollectionDeleted | CollectionEventSubscriptionFragment_CollectionUpdated;

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

export type PromotionEventSubscriptionFragment_PromotionCreated_promotion_Promotion_rules_PromotionRule = { cataloguePredicate: unknown | null };

export type PromotionEventSubscriptionFragment_PromotionCreated_promotion_Promotion = { rules: Array<PromotionEventSubscriptionFragment_PromotionCreated_promotion_Promotion_rules_PromotionRule> | null };

export type PromotionEventSubscriptionFragment_PromotionDeleted_promotion_Promotion_rules_PromotionRule = { cataloguePredicate: unknown | null };

export type PromotionEventSubscriptionFragment_PromotionDeleted_promotion_Promotion = { rules: Array<PromotionEventSubscriptionFragment_PromotionDeleted_promotion_Promotion_rules_PromotionRule> | null };

export type PromotionEventSubscriptionFragment_PromotionEnded_promotion_Promotion_rules_PromotionRule = { cataloguePredicate: unknown | null };

export type PromotionEventSubscriptionFragment_PromotionEnded_promotion_Promotion = { rules: Array<PromotionEventSubscriptionFragment_PromotionEnded_promotion_Promotion_rules_PromotionRule> | null };

export type PromotionEventSubscriptionFragment_PromotionRuleCreated_promotionRule_PromotionRule = { cataloguePredicate: unknown | null };

export type PromotionEventSubscriptionFragment_PromotionRuleDeleted_promotionRule_PromotionRule = { cataloguePredicate: unknown | null };

export type PromotionEventSubscriptionFragment_PromotionRuleUpdated_promotionRule_PromotionRule = { cataloguePredicate: unknown | null };

export type PromotionEventSubscriptionFragment_PromotionStarted_promotion_Promotion_rules_PromotionRule = { cataloguePredicate: unknown | null };

export type PromotionEventSubscriptionFragment_PromotionStarted_promotion_Promotion = { rules: Array<PromotionEventSubscriptionFragment_PromotionStarted_promotion_Promotion_rules_PromotionRule> | null };

export type PromotionEventSubscriptionFragment_PromotionUpdated_promotion_Promotion_rules_PromotionRule = { cataloguePredicate: unknown | null };

export type PromotionEventSubscriptionFragment_PromotionUpdated_promotion_Promotion = { rules: Array<PromotionEventSubscriptionFragment_PromotionUpdated_promotion_Promotion_rules_PromotionRule> | null };

export type PromotionEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s = { __typename: 'AccountChangeEmailRequested' | 'AccountConfirmationRequested' | 'AccountConfirmed' | 'AccountDeleteRequested' | 'AccountDeleted' | 'AccountEmailChanged' | 'AccountSetPasswordRequested' | 'AddressCreated' | 'AddressDeleted' | 'AddressUpdated' | 'AppDeleted' | 'AppInstalled' | 'AppStatusChanged' | 'AppUpdated' | 'AttributeCreated' | 'AttributeDeleted' | 'AttributeUpdated' | 'AttributeValueCreated' | 'AttributeValueDeleted' | 'AttributeValueUpdated' };

export type PromotionEventSubscriptionFragment_QJpVopnj9tAw174uVjo0KxVhwcLOzKKnfYk3kiIjlRi = { __typename: 'CalculateTaxes' | 'CategoryCreated' | 'CategoryDeleted' | 'CategoryUpdated' | 'ChannelCreated' | 'ChannelDeleted' | 'ChannelMetadataUpdated' | 'ChannelStatusChanged' | 'ChannelUpdated' | 'CheckoutCreated' | 'CheckoutFilterShippingMethods' | 'CheckoutFullyPaid' | 'CheckoutMetadataUpdated' | 'CheckoutUpdated' | 'CollectionCreated' | 'CollectionDeleted' | 'CollectionMetadataUpdated' | 'CollectionUpdated' | 'CustomerCreated' | 'CustomerMetadataUpdated' };

export type PromotionEventSubscriptionFragment_JmEtZQo0d9WfwXdErwExR3cyw1iBd2N3dSKfWlpIxc = { __typename: 'CustomerUpdated' | 'DraftOrderCreated' | 'DraftOrderDeleted' | 'DraftOrderUpdated' | 'FulfillmentApproved' | 'FulfillmentCanceled' | 'FulfillmentCreated' | 'FulfillmentMetadataUpdated' | 'FulfillmentTrackingNumberUpdated' | 'GiftCardCreated' | 'GiftCardDeleted' | 'GiftCardExportCompleted' | 'GiftCardMetadataUpdated' | 'GiftCardSent' | 'GiftCardStatusChanged' | 'GiftCardUpdated' | 'InvoiceDeleted' | 'InvoiceRequested' | 'InvoiceSent' | 'ListStoredPaymentMethods' };

export type PromotionEventSubscriptionFragment_IIttyh9obOk2HiNzq9wRoe2KykonejXScLlZcpen38 = { __typename: 'MenuCreated' | 'MenuDeleted' | 'MenuItemCreated' | 'MenuItemDeleted' | 'MenuItemUpdated' | 'MenuUpdated' | 'OrderBulkCreated' | 'OrderCancelled' | 'OrderConfirmed' | 'OrderCreated' | 'OrderExpired' | 'OrderFilterShippingMethods' | 'OrderFulfilled' | 'OrderFullyPaid' | 'OrderFullyRefunded' | 'OrderMetadataUpdated' | 'OrderPaid' | 'OrderRefunded' | 'OrderUpdated' | 'PageCreated' };

export type PromotionEventSubscriptionFragment_AH3BZpCszuOvBtBprYx65eaRIx5Joylb7Ve3GdBzgk = { __typename: 'PageDeleted' | 'PageTypeCreated' | 'PageTypeDeleted' | 'PageTypeUpdated' | 'PageUpdated' | 'PaymentAuthorize' | 'PaymentCaptureEvent' | 'PaymentConfirmEvent' | 'PaymentGatewayInitializeSession' | 'PaymentGatewayInitializeTokenizationSession' | 'PaymentListGateways' | 'PaymentMethodInitializeTokenizationSession' | 'PaymentMethodProcessTokenizationSession' | 'PaymentProcessEvent' | 'PaymentRefundEvent' | 'PaymentVoidEvent' | 'PermissionGroupCreated' | 'PermissionGroupDeleted' | 'PermissionGroupUpdated' | 'ProductCreated' };

export type PromotionEventSubscriptionFragment_DJv4PoQRoH3Sw9itoS68IxQyxEbIqR9lgE9EuaxdOlo = { __typename: 'ProductDeleted' | 'ProductExportCompleted' | 'ProductMediaCreated' | 'ProductMediaDeleted' | 'ProductMediaUpdated' | 'ProductMetadataUpdated' | 'ProductUpdated' | 'ProductVariantBackInStock' | 'ProductVariantCreated' | 'ProductVariantDeleted' | 'ProductVariantMetadataUpdated' | 'ProductVariantOutOfStock' | 'ProductVariantStockUpdated' | 'ProductVariantUpdated' | 'SaleCreated' | 'SaleDeleted' | 'SaleToggle' | 'SaleUpdated' | 'ShippingListMethodsForCheckout' | 'ShippingPriceCreated' };

export type PromotionEventSubscriptionFragment_O3Odkl1rHiKpTuOycy6Qd09EYpbs14jJy5wKvtzohq = { __typename: 'ShippingPriceDeleted' | 'ShippingPriceUpdated' | 'ShippingZoneCreated' | 'ShippingZoneDeleted' | 'ShippingZoneMetadataUpdated' | 'ShippingZoneUpdated' | 'ShopMetadataUpdated' | 'StaffCreated' | 'StaffDeleted' | 'StaffSetPasswordRequested' | 'StaffUpdated' | 'StoredPaymentMethodDeleteRequested' | 'ThumbnailCreated' | 'TransactionCancelationRequested' | 'TransactionChargeRequested' | 'TransactionInitializeSession' | 'TransactionItemMetadataUpdated' | 'TransactionProcessSession' | 'TransactionRefundRequested' | 'TranslationCreated' };

export type PromotionEventSubscriptionFragment_JXbGijkcN0lk4AuvKqLiWEvBdUhjbZ22m9Sq4IPl8 = { __typename: 'TranslationUpdated' | 'VoucherCodeExportCompleted' | 'VoucherCodesCreated' | 'VoucherCodesDeleted' | 'VoucherCreated' | 'VoucherDeleted' | 'VoucherMetadataUpdated' | 'VoucherUpdated' | 'WarehouseCreated' | 'WarehouseDeleted' | 'WarehouseMetadataUpdated' | 'WarehouseUpdated' };

export type PromotionEventSubscriptionFragment_PromotionCreated = (
  { promotion: PromotionEventSubscriptionFragment_PromotionCreated_promotion_Promotion | null }
  & { __typename: 'PromotionCreated' }
);

export type PromotionEventSubscriptionFragment_PromotionDeleted = (
  { promotion: PromotionEventSubscriptionFragment_PromotionDeleted_promotion_Promotion | null }
  & { __typename: 'PromotionDeleted' }
);

export type PromotionEventSubscriptionFragment_PromotionEnded = (
  { promotion: PromotionEventSubscriptionFragment_PromotionEnded_promotion_Promotion | null }
  & { __typename: 'PromotionEnded' }
);

export type PromotionEventSubscriptionFragment_PromotionRuleCreated = (
  { promotionRule: PromotionEventSubscriptionFragment_PromotionRuleCreated_promotionRule_PromotionRule | null }
  & { __typename: 'PromotionRuleCreated' }
);

export type PromotionEventSubscriptionFragment_PromotionRuleDeleted = (
  { promotionRule: PromotionEventSubscriptionFragment_PromotionRuleDeleted_promotionRule_PromotionRule | null }
  & { __typename: 'PromotionRuleDeleted' }
);

export type PromotionEventSubscriptionFragment_PromotionRuleUpdated = (
  { promotionRule: PromotionEventSubscriptionFragment_PromotionRuleUpdated_promotionRule_PromotionRule | null }
  & { __typename: 'PromotionRuleUpdated' }
);

export type PromotionEventSubscriptionFragment_PromotionStarted = (
  { promotion: PromotionEventSubscriptionFragment_PromotionStarted_promotion_Promotion | null }
  & { __typename: 'PromotionStarted' }
);

export type PromotionEventSubscriptionFragment_PromotionUpdated = (
  { promotion: PromotionEventSubscriptionFragment_PromotionUpdated_promotion_Promotion | null }
  & { __typename: 'PromotionUpdated' }
);

export type PromotionEventSubscriptionFragment = PromotionEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s | PromotionEventSubscriptionFragment_QJpVopnj9tAw174uVjo0KxVhwcLOzKKnfYk3kiIjlRi | PromotionEventSubscriptionFragment_JmEtZQo0d9WfwXdErwExR3cyw1iBd2N3dSKfWlpIxc | PromotionEventSubscriptionFragment_IIttyh9obOk2HiNzq9wRoe2KykonejXScLlZcpen38 | PromotionEventSubscriptionFragment_AH3BZpCszuOvBtBprYx65eaRIx5Joylb7Ve3GdBzgk | PromotionEventSubscriptionFragment_DJv4PoQRoH3Sw9itoS68IxQyxEbIqR9lgE9EuaxdOlo | PromotionEventSubscriptionFragment_O3Odkl1rHiKpTuOycy6Qd09EYpbs14jJy5wKvtzohq | PromotionEventSubscriptionFragment_JXbGijkcN0lk4AuvKqLiWEvBdUhjbZ22m9Sq4IPl8 | PromotionEventSubscriptionFragment_PromotionCreated | PromotionEventSubscriptionFragment_PromotionDeleted | PromotionEventSubscriptionFragment_PromotionEnded | PromotionEventSubscriptionFragment_PromotionRuleCreated | PromotionEventSubscriptionFragment_PromotionRuleDeleted | PromotionEventSubscriptionFragment_PromotionRuleUpdated | PromotionEventSubscriptionFragment_PromotionStarted | PromotionEventSubscriptionFragment_PromotionUpdated;

export type TaxedMoney_TaxedMoney_net_Money = { currency: string, amount: number };

export type TaxedMoney_TaxedMoney_gross_Money = { currency: string, amount: number };

export type TaxedMoney_TaxedMoney_tax_Money = { currency: string, amount: number };

export type TaxedMoney = { net: TaxedMoney_TaxedMoney_net_Money, gross: TaxedMoney_TaxedMoney_gross_Money, tax: TaxedMoney_TaxedMoney_tax_Money };

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
export const CollectionEventSubscriptionFragment = new TypedDocumentString(`
    fragment CollectionEventSubscriptionFragment on Event {
  __typename
  ... on CollectionUpdated {
    collection {
      slug
    }
  }
  ... on CollectionDeleted {
    collection {
      slug
    }
  }
  ... on CollectionCreated {
    __typename
    collection {
      slug
    }
  }
}
    `, {"fragmentName":"CollectionEventSubscriptionFragment"}) as unknown as TypedDocumentString<CollectionEventSubscriptionFragment, unknown>;
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
export const PromotionEventSubscriptionFragment = new TypedDocumentString(`
    fragment PromotionEventSubscriptionFragment on Event {
  __typename
  ... on PromotionUpdated {
    promotion {
      rules {
        cataloguePredicate
      }
    }
  }
  ... on PromotionCreated {
    promotion {
      rules {
        cataloguePredicate
      }
    }
  }
  ... on PromotionDeleted {
    promotion {
      rules {
        cataloguePredicate
      }
    }
  }
  ... on PromotionStarted {
    promotion {
      rules {
        cataloguePredicate
      }
    }
  }
  ... on PromotionEnded {
    promotion {
      rules {
        cataloguePredicate
      }
    }
  }
  ... on PromotionRuleCreated {
    promotionRule {
      cataloguePredicate
    }
  }
  ... on PromotionRuleUpdated {
    promotionRule {
      cataloguePredicate
    }
  }
  ... on PromotionRuleDeleted {
    promotionRule {
      cataloguePredicate
    }
  }
}
    `, {"fragmentName":"PromotionEventSubscriptionFragment"}) as unknown as TypedDocumentString<PromotionEventSubscriptionFragment, unknown>;
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