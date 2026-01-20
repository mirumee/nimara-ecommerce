import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CollectionEventSubscriptionFragment_CollectionDeleted_collection_Collection = { slug: string };

export type CollectionEventSubscriptionFragment_CollectionUpdated_collection_Collection = { slug: string };

export type CollectionEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s = { __typename: 'AccountChangeEmailRequested' | 'AccountConfirmationRequested' | 'AccountConfirmed' | 'AccountDeleteRequested' | 'AccountDeleted' | 'AccountEmailChanged' | 'AccountSetPasswordRequested' | 'AddressCreated' | 'AddressDeleted' | 'AddressUpdated' | 'AppDeleted' | 'AppInstalled' | 'AppStatusChanged' | 'AppUpdated' | 'AttributeCreated' | 'AttributeDeleted' | 'AttributeUpdated' | 'AttributeValueCreated' | 'AttributeValueDeleted' | 'AttributeValueUpdated' };

export type CollectionEventSubscriptionFragment_RrvYhheqNjg9coPa7MxzKvNbxTiUdNyksBoKzspcyo = { __typename: 'CalculateTaxes' | 'CategoryCreated' | 'CategoryDeleted' | 'CategoryUpdated' | 'ChannelCreated' | 'ChannelDeleted' | 'ChannelMetadataUpdated' | 'ChannelStatusChanged' | 'ChannelUpdated' | 'CheckoutCreated' | 'CheckoutFilterShippingMethods' | 'CheckoutFullyAuthorized' | 'CheckoutFullyPaid' | 'CheckoutMetadataUpdated' | 'CheckoutUpdated' | 'CollectionCreated' | 'CollectionMetadataUpdated' | 'CustomerCreated' | 'CustomerMetadataUpdated' | 'CustomerUpdated' };

export type CollectionEventSubscriptionFragment_IOmIHgezj4BqSe0qBa27Ry4w4In3hD62xLNv1Dlw = { __typename: 'DraftOrderCreated' | 'DraftOrderDeleted' | 'DraftOrderUpdated' | 'FulfillmentApproved' | 'FulfillmentCanceled' | 'FulfillmentCreated' | 'FulfillmentMetadataUpdated' | 'FulfillmentTrackingNumberUpdated' | 'GiftCardCreated' | 'GiftCardDeleted' | 'GiftCardExportCompleted' | 'GiftCardMetadataUpdated' | 'GiftCardSent' | 'GiftCardStatusChanged' | 'GiftCardUpdated' | 'InvoiceDeleted' | 'InvoiceRequested' | 'InvoiceSent' | 'ListStoredPaymentMethods' | 'MenuCreated' };

export type CollectionEventSubscriptionFragment_NzAgx5ipNwNrprvvHc2qLsxAIqOZxfb0Ab5nlcQwU = { __typename: 'MenuDeleted' | 'MenuItemCreated' | 'MenuItemDeleted' | 'MenuItemUpdated' | 'MenuUpdated' | 'OrderBulkCreated' | 'OrderCancelled' | 'OrderConfirmed' | 'OrderCreated' | 'OrderExpired' | 'OrderFilterShippingMethods' | 'OrderFulfilled' | 'OrderFullyPaid' | 'OrderFullyRefunded' | 'OrderMetadataUpdated' | 'OrderPaid' | 'OrderRefunded' | 'OrderUpdated' | 'PageCreated' | 'PageDeleted' };

export type CollectionEventSubscriptionFragment_1E3eTt7xP6B7Mkgmqq5X7sVIf5QtQseWfIxUecQwhV0 = { __typename: 'PageTypeCreated' | 'PageTypeDeleted' | 'PageTypeUpdated' | 'PageUpdated' | 'PaymentAuthorize' | 'PaymentCaptureEvent' | 'PaymentConfirmEvent' | 'PaymentGatewayInitializeSession' | 'PaymentGatewayInitializeTokenizationSession' | 'PaymentListGateways' | 'PaymentMethodInitializeTokenizationSession' | 'PaymentMethodProcessTokenizationSession' | 'PaymentProcessEvent' | 'PaymentRefundEvent' | 'PaymentVoidEvent' | 'PermissionGroupCreated' | 'PermissionGroupDeleted' | 'PermissionGroupUpdated' | 'ProductCreated' | 'ProductDeleted' };

export type CollectionEventSubscriptionFragment_Z7rwgw8zu01Bnc5SgQqNwv0Lyp1jQ30oJz3Z8uvrhEw = { __typename: 'ProductExportCompleted' | 'ProductMediaCreated' | 'ProductMediaDeleted' | 'ProductMediaUpdated' | 'ProductMetadataUpdated' | 'ProductUpdated' | 'ProductVariantBackInStock' | 'ProductVariantCreated' | 'ProductVariantDeleted' | 'ProductVariantMetadataUpdated' | 'ProductVariantOutOfStock' | 'ProductVariantStockUpdated' | 'ProductVariantUpdated' | 'PromotionCreated' | 'PromotionDeleted' | 'PromotionEnded' | 'PromotionRuleCreated' | 'PromotionRuleDeleted' | 'PromotionRuleUpdated' | 'PromotionStarted' };

export type CollectionEventSubscriptionFragment_FsCnoBef8jWxBeWLo55z4FkYvj19c9pK9ySq77aoQq = { __typename: 'PromotionUpdated' | 'SaleCreated' | 'SaleDeleted' | 'SaleToggle' | 'SaleUpdated' | 'ShippingListMethodsForCheckout' | 'ShippingPriceCreated' | 'ShippingPriceDeleted' | 'ShippingPriceUpdated' | 'ShippingZoneCreated' | 'ShippingZoneDeleted' | 'ShippingZoneMetadataUpdated' | 'ShippingZoneUpdated' | 'ShopMetadataUpdated' | 'StaffCreated' | 'StaffDeleted' | 'StaffSetPasswordRequested' | 'StaffUpdated' | 'StoredPaymentMethodDeleteRequested' | 'ThumbnailCreated' };

export type CollectionEventSubscriptionFragment_V8I7ofYZlQ6mRbyZppdZBtAVuVhCxrv4cl7r3Nc1xQ = { __typename: 'TransactionCancelationRequested' | 'TransactionChargeRequested' | 'TransactionInitializeSession' | 'TransactionItemMetadataUpdated' | 'TransactionProcessSession' | 'TransactionRefundRequested' | 'TranslationCreated' | 'TranslationUpdated' | 'VoucherCodeExportCompleted' | 'VoucherCodesCreated' | 'VoucherCodesDeleted' | 'VoucherCreated' | 'VoucherDeleted' | 'VoucherMetadataUpdated' | 'VoucherUpdated' | 'WarehouseCreated' | 'WarehouseDeleted' | 'WarehouseMetadataUpdated' | 'WarehouseUpdated' };

export type CollectionEventSubscriptionFragment_CollectionDeleted = (
  { collection: CollectionEventSubscriptionFragment_CollectionDeleted_collection_Collection | null }
  & { __typename: 'CollectionDeleted' }
);

export type CollectionEventSubscriptionFragment_CollectionUpdated = (
  { collection: CollectionEventSubscriptionFragment_CollectionUpdated_collection_Collection | null }
  & { __typename: 'CollectionUpdated' }
);

export type CollectionEventSubscriptionFragment = CollectionEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s | CollectionEventSubscriptionFragment_RrvYhheqNjg9coPa7MxzKvNbxTiUdNyksBoKzspcyo | CollectionEventSubscriptionFragment_IOmIHgezj4BqSe0qBa27Ry4w4In3hD62xLNv1Dlw | CollectionEventSubscriptionFragment_NzAgx5ipNwNrprvvHc2qLsxAIqOZxfb0Ab5nlcQwU | CollectionEventSubscriptionFragment_1E3eTt7xP6B7Mkgmqq5X7sVIf5QtQseWfIxUecQwhV0 | CollectionEventSubscriptionFragment_Z7rwgw8zu01Bnc5SgQqNwv0Lyp1jQ30oJz3Z8uvrhEw | CollectionEventSubscriptionFragment_FsCnoBef8jWxBeWLo55z4FkYvj19c9pK9ySq77aoQq | CollectionEventSubscriptionFragment_V8I7ofYZlQ6mRbyZppdZBtAVuVhCxrv4cl7r3Nc1xQ | CollectionEventSubscriptionFragment_CollectionDeleted | CollectionEventSubscriptionFragment_CollectionUpdated;

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

export type MenuEventSubscriptionFragment_GwYHqJDwvrv2QyEq0Kya5B6RfhCy85iuAlJzAq6AdU = { __typename: 'CalculateTaxes' | 'CategoryCreated' | 'CategoryDeleted' | 'CategoryUpdated' | 'ChannelCreated' | 'ChannelDeleted' | 'ChannelMetadataUpdated' | 'ChannelStatusChanged' | 'ChannelUpdated' | 'CheckoutCreated' | 'CheckoutFilterShippingMethods' | 'CheckoutFullyAuthorized' | 'CheckoutFullyPaid' | 'CheckoutMetadataUpdated' | 'CheckoutUpdated' | 'CollectionCreated' | 'CollectionDeleted' | 'CollectionMetadataUpdated' | 'CollectionUpdated' | 'CustomerCreated' };

export type MenuEventSubscriptionFragment_XWulXk1GqeHNvK2Zjg39D81UqhO8ZykBvc7wuJEvA = { __typename: 'CustomerMetadataUpdated' | 'CustomerUpdated' | 'DraftOrderCreated' | 'DraftOrderDeleted' | 'DraftOrderUpdated' | 'FulfillmentApproved' | 'FulfillmentCanceled' | 'FulfillmentCreated' | 'FulfillmentMetadataUpdated' | 'FulfillmentTrackingNumberUpdated' | 'GiftCardCreated' | 'GiftCardDeleted' | 'GiftCardExportCompleted' | 'GiftCardMetadataUpdated' | 'GiftCardSent' | 'GiftCardStatusChanged' | 'GiftCardUpdated' | 'InvoiceDeleted' | 'InvoiceRequested' | 'InvoiceSent' };

export type MenuEventSubscriptionFragment_6SZv9znezpLhGpS69dQ1GbY5yDKa5XUxykJztqqTg6U = { __typename: 'ListStoredPaymentMethods' | 'OrderBulkCreated' | 'OrderCancelled' | 'OrderConfirmed' | 'OrderCreated' | 'OrderExpired' | 'OrderFilterShippingMethods' | 'OrderFulfilled' | 'OrderFullyPaid' | 'OrderFullyRefunded' | 'OrderMetadataUpdated' | 'OrderPaid' | 'OrderRefunded' | 'OrderUpdated' | 'PageCreated' | 'PageDeleted' | 'PageTypeCreated' | 'PageTypeDeleted' | 'PageTypeUpdated' | 'PageUpdated' };

export type MenuEventSubscriptionFragment_6kRlk3To6sPpW0QQr52mUNjVn2CzSdpyN0o8Cy5kQ70 = { __typename: 'PaymentAuthorize' | 'PaymentCaptureEvent' | 'PaymentConfirmEvent' | 'PaymentGatewayInitializeSession' | 'PaymentGatewayInitializeTokenizationSession' | 'PaymentListGateways' | 'PaymentMethodInitializeTokenizationSession' | 'PaymentMethodProcessTokenizationSession' | 'PaymentProcessEvent' | 'PaymentRefundEvent' | 'PaymentVoidEvent' | 'PermissionGroupCreated' | 'PermissionGroupDeleted' | 'PermissionGroupUpdated' | 'ProductCreated' | 'ProductDeleted' | 'ProductExportCompleted' | 'ProductMediaCreated' | 'ProductMediaDeleted' | 'ProductMediaUpdated' };

export type MenuEventSubscriptionFragment_Rhl3UnNk6nEi747MfPtEghacMvrlEq0zkU4BVjs = { __typename: 'ProductMetadataUpdated' | 'ProductUpdated' | 'ProductVariantBackInStock' | 'ProductVariantCreated' | 'ProductVariantDeleted' | 'ProductVariantMetadataUpdated' | 'ProductVariantOutOfStock' | 'ProductVariantStockUpdated' | 'ProductVariantUpdated' | 'PromotionCreated' | 'PromotionDeleted' | 'PromotionEnded' | 'PromotionRuleCreated' | 'PromotionRuleDeleted' | 'PromotionRuleUpdated' | 'PromotionStarted' | 'PromotionUpdated' | 'SaleCreated' | 'SaleDeleted' | 'SaleToggle' };

export type MenuEventSubscriptionFragment_W5T9u8Ze80BUkN79Oq6SmIzz96pnf5x7CafMXoKzjye = { __typename: 'SaleUpdated' | 'ShippingListMethodsForCheckout' | 'ShippingPriceCreated' | 'ShippingPriceDeleted' | 'ShippingPriceUpdated' | 'ShippingZoneCreated' | 'ShippingZoneDeleted' | 'ShippingZoneMetadataUpdated' | 'ShippingZoneUpdated' | 'ShopMetadataUpdated' | 'StaffCreated' | 'StaffDeleted' | 'StaffSetPasswordRequested' | 'StaffUpdated' | 'StoredPaymentMethodDeleteRequested' | 'ThumbnailCreated' | 'TransactionCancelationRequested' | 'TransactionChargeRequested' | 'TransactionInitializeSession' | 'TransactionItemMetadataUpdated' };

export type MenuEventSubscriptionFragment_YvQxrNkoOvnbjiQk7JSzAwJglAbMml79KptInbPmJ50 = { __typename: 'TransactionProcessSession' | 'TransactionRefundRequested' | 'TranslationCreated' | 'TranslationUpdated' | 'VoucherCodeExportCompleted' | 'VoucherCodesCreated' | 'VoucherCodesDeleted' | 'VoucherCreated' | 'VoucherDeleted' | 'VoucherMetadataUpdated' | 'VoucherUpdated' | 'WarehouseCreated' | 'WarehouseDeleted' | 'WarehouseMetadataUpdated' | 'WarehouseUpdated' };

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

export type MenuEventSubscriptionFragment = MenuEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s | MenuEventSubscriptionFragment_GwYHqJDwvrv2QyEq0Kya5B6RfhCy85iuAlJzAq6AdU | MenuEventSubscriptionFragment_XWulXk1GqeHNvK2Zjg39D81UqhO8ZykBvc7wuJEvA | MenuEventSubscriptionFragment_6SZv9znezpLhGpS69dQ1GbY5yDKa5XUxykJztqqTg6U | MenuEventSubscriptionFragment_6kRlk3To6sPpW0QQr52mUNjVn2CzSdpyN0o8Cy5kQ70 | MenuEventSubscriptionFragment_Rhl3UnNk6nEi747MfPtEghacMvrlEq0zkU4BVjs | MenuEventSubscriptionFragment_W5T9u8Ze80BUkN79Oq6SmIzz96pnf5x7CafMXoKzjye | MenuEventSubscriptionFragment_YvQxrNkoOvnbjiQk7JSzAwJglAbMml79KptInbPmJ50 | MenuEventSubscriptionFragment_MenuCreated | MenuEventSubscriptionFragment_MenuDeleted | MenuEventSubscriptionFragment_MenuItemCreated | MenuEventSubscriptionFragment_MenuItemDeleted | MenuEventSubscriptionFragment_MenuItemUpdated | MenuEventSubscriptionFragment_MenuUpdated;

export type Money = { currency: string, amount: number };

export type PageEventSubscriptionFragment_PageCreated_page_Page = { slug: string };

export type PageEventSubscriptionFragment_PageDeleted_page_Page = { slug: string };

export type PageEventSubscriptionFragment_PageTypeCreated_pageType_PageType = { slug: string };

export type PageEventSubscriptionFragment_PageTypeDeleted_pageType_PageType = { slug: string };

export type PageEventSubscriptionFragment_PageTypeUpdated_pageType_PageType = { slug: string };

export type PageEventSubscriptionFragment_PageUpdated_page_Page = { slug: string };

export type PageEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s = { __typename: 'AccountChangeEmailRequested' | 'AccountConfirmationRequested' | 'AccountConfirmed' | 'AccountDeleteRequested' | 'AccountDeleted' | 'AccountEmailChanged' | 'AccountSetPasswordRequested' | 'AddressCreated' | 'AddressDeleted' | 'AddressUpdated' | 'AppDeleted' | 'AppInstalled' | 'AppStatusChanged' | 'AppUpdated' | 'AttributeCreated' | 'AttributeDeleted' | 'AttributeUpdated' | 'AttributeValueCreated' | 'AttributeValueDeleted' | 'AttributeValueUpdated' };

export type PageEventSubscriptionFragment_GwYHqJDwvrv2QyEq0Kya5B6RfhCy85iuAlJzAq6AdU = { __typename: 'CalculateTaxes' | 'CategoryCreated' | 'CategoryDeleted' | 'CategoryUpdated' | 'ChannelCreated' | 'ChannelDeleted' | 'ChannelMetadataUpdated' | 'ChannelStatusChanged' | 'ChannelUpdated' | 'CheckoutCreated' | 'CheckoutFilterShippingMethods' | 'CheckoutFullyAuthorized' | 'CheckoutFullyPaid' | 'CheckoutMetadataUpdated' | 'CheckoutUpdated' | 'CollectionCreated' | 'CollectionDeleted' | 'CollectionMetadataUpdated' | 'CollectionUpdated' | 'CustomerCreated' };

export type PageEventSubscriptionFragment_XWulXk1GqeHNvK2Zjg39D81UqhO8ZykBvc7wuJEvA = { __typename: 'CustomerMetadataUpdated' | 'CustomerUpdated' | 'DraftOrderCreated' | 'DraftOrderDeleted' | 'DraftOrderUpdated' | 'FulfillmentApproved' | 'FulfillmentCanceled' | 'FulfillmentCreated' | 'FulfillmentMetadataUpdated' | 'FulfillmentTrackingNumberUpdated' | 'GiftCardCreated' | 'GiftCardDeleted' | 'GiftCardExportCompleted' | 'GiftCardMetadataUpdated' | 'GiftCardSent' | 'GiftCardStatusChanged' | 'GiftCardUpdated' | 'InvoiceDeleted' | 'InvoiceRequested' | 'InvoiceSent' };

export type PageEventSubscriptionFragment_Qo3grqPrpe4HInn1EwEhNaiRstQso5tTjYam1lLlKa = { __typename: 'ListStoredPaymentMethods' | 'MenuCreated' | 'MenuDeleted' | 'MenuItemCreated' | 'MenuItemDeleted' | 'MenuItemUpdated' | 'MenuUpdated' | 'OrderBulkCreated' | 'OrderCancelled' | 'OrderConfirmed' | 'OrderCreated' | 'OrderExpired' | 'OrderFilterShippingMethods' | 'OrderFulfilled' | 'OrderFullyPaid' | 'OrderFullyRefunded' | 'OrderMetadataUpdated' | 'OrderPaid' | 'OrderRefunded' | 'OrderUpdated' };

export type PageEventSubscriptionFragment_6kRlk3To6sPpW0QQr52mUNjVn2CzSdpyN0o8Cy5kQ70 = { __typename: 'PaymentAuthorize' | 'PaymentCaptureEvent' | 'PaymentConfirmEvent' | 'PaymentGatewayInitializeSession' | 'PaymentGatewayInitializeTokenizationSession' | 'PaymentListGateways' | 'PaymentMethodInitializeTokenizationSession' | 'PaymentMethodProcessTokenizationSession' | 'PaymentProcessEvent' | 'PaymentRefundEvent' | 'PaymentVoidEvent' | 'PermissionGroupCreated' | 'PermissionGroupDeleted' | 'PermissionGroupUpdated' | 'ProductCreated' | 'ProductDeleted' | 'ProductExportCompleted' | 'ProductMediaCreated' | 'ProductMediaDeleted' | 'ProductMediaUpdated' };

export type PageEventSubscriptionFragment_Rhl3UnNk6nEi747MfPtEghacMvrlEq0zkU4BVjs = { __typename: 'ProductMetadataUpdated' | 'ProductUpdated' | 'ProductVariantBackInStock' | 'ProductVariantCreated' | 'ProductVariantDeleted' | 'ProductVariantMetadataUpdated' | 'ProductVariantOutOfStock' | 'ProductVariantStockUpdated' | 'ProductVariantUpdated' | 'PromotionCreated' | 'PromotionDeleted' | 'PromotionEnded' | 'PromotionRuleCreated' | 'PromotionRuleDeleted' | 'PromotionRuleUpdated' | 'PromotionStarted' | 'PromotionUpdated' | 'SaleCreated' | 'SaleDeleted' | 'SaleToggle' };

export type PageEventSubscriptionFragment_W5T9u8Ze80BUkN79Oq6SmIzz96pnf5x7CafMXoKzjye = { __typename: 'SaleUpdated' | 'ShippingListMethodsForCheckout' | 'ShippingPriceCreated' | 'ShippingPriceDeleted' | 'ShippingPriceUpdated' | 'ShippingZoneCreated' | 'ShippingZoneDeleted' | 'ShippingZoneMetadataUpdated' | 'ShippingZoneUpdated' | 'ShopMetadataUpdated' | 'StaffCreated' | 'StaffDeleted' | 'StaffSetPasswordRequested' | 'StaffUpdated' | 'StoredPaymentMethodDeleteRequested' | 'ThumbnailCreated' | 'TransactionCancelationRequested' | 'TransactionChargeRequested' | 'TransactionInitializeSession' | 'TransactionItemMetadataUpdated' };

export type PageEventSubscriptionFragment_YvQxrNkoOvnbjiQk7JSzAwJglAbMml79KptInbPmJ50 = { __typename: 'TransactionProcessSession' | 'TransactionRefundRequested' | 'TranslationCreated' | 'TranslationUpdated' | 'VoucherCodeExportCompleted' | 'VoucherCodesCreated' | 'VoucherCodesDeleted' | 'VoucherCreated' | 'VoucherDeleted' | 'VoucherMetadataUpdated' | 'VoucherUpdated' | 'WarehouseCreated' | 'WarehouseDeleted' | 'WarehouseMetadataUpdated' | 'WarehouseUpdated' };

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

export type PageEventSubscriptionFragment = PageEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s | PageEventSubscriptionFragment_GwYHqJDwvrv2QyEq0Kya5B6RfhCy85iuAlJzAq6AdU | PageEventSubscriptionFragment_XWulXk1GqeHNvK2Zjg39D81UqhO8ZykBvc7wuJEvA | PageEventSubscriptionFragment_Qo3grqPrpe4HInn1EwEhNaiRstQso5tTjYam1lLlKa | PageEventSubscriptionFragment_6kRlk3To6sPpW0QQr52mUNjVn2CzSdpyN0o8Cy5kQ70 | PageEventSubscriptionFragment_Rhl3UnNk6nEi747MfPtEghacMvrlEq0zkU4BVjs | PageEventSubscriptionFragment_W5T9u8Ze80BUkN79Oq6SmIzz96pnf5x7CafMXoKzjye | PageEventSubscriptionFragment_YvQxrNkoOvnbjiQk7JSzAwJglAbMml79KptInbPmJ50 | PageEventSubscriptionFragment_PageCreated | PageEventSubscriptionFragment_PageDeleted | PageEventSubscriptionFragment_PageTypeCreated | PageEventSubscriptionFragment_PageTypeDeleted | PageEventSubscriptionFragment_PageTypeUpdated | PageEventSubscriptionFragment_PageUpdated;

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

export type ProductEventSubscriptionFragment_GwYHqJDwvrv2QyEq0Kya5B6RfhCy85iuAlJzAq6AdU = { __typename: 'CalculateTaxes' | 'CategoryCreated' | 'CategoryDeleted' | 'CategoryUpdated' | 'ChannelCreated' | 'ChannelDeleted' | 'ChannelMetadataUpdated' | 'ChannelStatusChanged' | 'ChannelUpdated' | 'CheckoutCreated' | 'CheckoutFilterShippingMethods' | 'CheckoutFullyAuthorized' | 'CheckoutFullyPaid' | 'CheckoutMetadataUpdated' | 'CheckoutUpdated' | 'CollectionCreated' | 'CollectionDeleted' | 'CollectionMetadataUpdated' | 'CollectionUpdated' | 'CustomerCreated' };

export type ProductEventSubscriptionFragment_XWulXk1GqeHNvK2Zjg39D81UqhO8ZykBvc7wuJEvA = { __typename: 'CustomerMetadataUpdated' | 'CustomerUpdated' | 'DraftOrderCreated' | 'DraftOrderDeleted' | 'DraftOrderUpdated' | 'FulfillmentApproved' | 'FulfillmentCanceled' | 'FulfillmentCreated' | 'FulfillmentMetadataUpdated' | 'FulfillmentTrackingNumberUpdated' | 'GiftCardCreated' | 'GiftCardDeleted' | 'GiftCardExportCompleted' | 'GiftCardMetadataUpdated' | 'GiftCardSent' | 'GiftCardStatusChanged' | 'GiftCardUpdated' | 'InvoiceDeleted' | 'InvoiceRequested' | 'InvoiceSent' };

export type ProductEventSubscriptionFragment_Qo3grqPrpe4HInn1EwEhNaiRstQso5tTjYam1lLlKa = { __typename: 'ListStoredPaymentMethods' | 'MenuCreated' | 'MenuDeleted' | 'MenuItemCreated' | 'MenuItemDeleted' | 'MenuItemUpdated' | 'MenuUpdated' | 'OrderBulkCreated' | 'OrderCancelled' | 'OrderConfirmed' | 'OrderCreated' | 'OrderExpired' | 'OrderFilterShippingMethods' | 'OrderFulfilled' | 'OrderFullyPaid' | 'OrderFullyRefunded' | 'OrderMetadataUpdated' | 'OrderPaid' | 'OrderRefunded' | 'OrderUpdated' };

export type ProductEventSubscriptionFragment_0Hg7UwAf5qDqrfrBkEq72AxaObrB0w2l4xizB32wmho = { __typename: 'PageCreated' | 'PageDeleted' | 'PageTypeCreated' | 'PageTypeDeleted' | 'PageTypeUpdated' | 'PageUpdated' | 'PaymentAuthorize' | 'PaymentCaptureEvent' | 'PaymentConfirmEvent' | 'PaymentGatewayInitializeSession' | 'PaymentGatewayInitializeTokenizationSession' | 'PaymentListGateways' | 'PaymentMethodInitializeTokenizationSession' | 'PaymentMethodProcessTokenizationSession' | 'PaymentProcessEvent' | 'PaymentRefundEvent' | 'PaymentVoidEvent' | 'PermissionGroupCreated' | 'PermissionGroupDeleted' | 'PermissionGroupUpdated' };

export type ProductEventSubscriptionFragment_GaRpV5WgLmyYwzvOncnidjvA9BqsuLaqkK8MskS5QAk = { __typename: 'ProductCreated' | 'ProductExportCompleted' | 'PromotionCreated' | 'PromotionDeleted' | 'PromotionEnded' | 'PromotionRuleCreated' | 'PromotionRuleDeleted' | 'PromotionRuleUpdated' | 'PromotionStarted' | 'PromotionUpdated' | 'SaleCreated' | 'SaleDeleted' | 'SaleToggle' | 'SaleUpdated' | 'ShippingListMethodsForCheckout' | 'ShippingPriceCreated' | 'ShippingPriceDeleted' | 'ShippingPriceUpdated' | 'ShippingZoneCreated' | 'ShippingZoneDeleted' };

export type ProductEventSubscriptionFragment_HwOxxNnVYeYl4jbk7puxZvo4KTvQJnkcex833Wfg = { __typename: 'ShippingZoneMetadataUpdated' | 'ShippingZoneUpdated' | 'ShopMetadataUpdated' | 'StaffCreated' | 'StaffDeleted' | 'StaffSetPasswordRequested' | 'StaffUpdated' | 'StoredPaymentMethodDeleteRequested' | 'ThumbnailCreated' | 'TransactionCancelationRequested' | 'TransactionChargeRequested' | 'TransactionInitializeSession' | 'TransactionItemMetadataUpdated' | 'TransactionProcessSession' | 'TransactionRefundRequested' | 'TranslationCreated' | 'TranslationUpdated' | 'VoucherCodeExportCompleted' | 'VoucherCodesCreated' | 'VoucherCodesDeleted' };

export type ProductEventSubscriptionFragment_90suajkXt8hiTAxfKMvbNnr0Zjq2loXudhjMa1vc = { __typename: 'VoucherCreated' | 'VoucherDeleted' | 'VoucherMetadataUpdated' | 'VoucherUpdated' | 'WarehouseCreated' | 'WarehouseDeleted' | 'WarehouseMetadataUpdated' | 'WarehouseUpdated' };

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

export type ProductEventSubscriptionFragment = ProductEventSubscriptionFragment_Uchm3Qz7YjEsQhTMfPIk01DEzLiWluHMnX4k1L6Dt0s | ProductEventSubscriptionFragment_GwYHqJDwvrv2QyEq0Kya5B6RfhCy85iuAlJzAq6AdU | ProductEventSubscriptionFragment_XWulXk1GqeHNvK2Zjg39D81UqhO8ZykBvc7wuJEvA | ProductEventSubscriptionFragment_Qo3grqPrpe4HInn1EwEhNaiRstQso5tTjYam1lLlKa | ProductEventSubscriptionFragment_0Hg7UwAf5qDqrfrBkEq72AxaObrB0w2l4xizB32wmho | ProductEventSubscriptionFragment_GaRpV5WgLmyYwzvOncnidjvA9BqsuLaqkK8MskS5QAk | ProductEventSubscriptionFragment_HwOxxNnVYeYl4jbk7puxZvo4KTvQJnkcex833Wfg | ProductEventSubscriptionFragment_90suajkXt8hiTAxfKMvbNnr0Zjq2loXudhjMa1vc | ProductEventSubscriptionFragment_ProductDeleted | ProductEventSubscriptionFragment_ProductMediaCreated | ProductEventSubscriptionFragment_ProductMediaDeleted | ProductEventSubscriptionFragment_ProductMediaUpdated | ProductEventSubscriptionFragment_ProductMetadataUpdated | ProductEventSubscriptionFragment_ProductUpdated | ProductEventSubscriptionFragment_ProductVariantBackInStock | ProductEventSubscriptionFragment_ProductVariantCreated | ProductEventSubscriptionFragment_ProductVariantDeleted | ProductEventSubscriptionFragment_ProductVariantMetadataUpdated | ProductEventSubscriptionFragment_ProductVariantOutOfStock | ProductEventSubscriptionFragment_ProductVariantStockUpdated | ProductEventSubscriptionFragment_ProductVariantUpdated;

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