import {
  type CheckoutCreateRequest,
  type CheckoutResponse,
  type CheckoutUpdateRequest,
  type CompleteCheckoutRequestWithAp2,
  type Order as UcpOrder,
  type UcpDiscoveryProfile,
} from "@ucp-js/sdk";

import type { BaseError } from "@nimara/domain/objects/Error";
import { type AsyncResult } from "@nimara/domain/objects/Result";

export type UCPServiceError = BaseError & {
  ucpCode?: string;
};

export type UCPResponse<TRes> = AsyncResult<TRes, UCPServiceError>;

// ── Catalog types ──────────────────────────────────────────────

export type CatalogSearchFilters = {
  categories?: string[];
  price?: { max?: number; min?: number };
};

export type CatalogSearchInput = {
  context?: Record<string, unknown>;
  filters?: CatalogSearchFilters;
  pagination?: {
    cursor?: string;
    limit?: number;
  };
  query?: string;
};

export type CatalogLookupInput = {
  context?: Record<string, unknown>;
  filters?: CatalogSearchFilters;
  ids: string[];
};

export type CatalogGetProductInput = {
  context?: Record<string, unknown>;
  filters?: CatalogSearchFilters;
  id: string;
  preferences?: string[];
  selected?: Array<{ label: string; name: string }>;
};

export type UcpPrice = {
  amount: number;
  currency: string;
};

export type UcpMedia = {
  alt_text?: string;
  height?: number;
  type: "image" | "model_3d" | "video";
  url: string;
  width?: number;
};

export type UcpVariant = {
  availability?: { available: boolean };
  description: { plain: string };
  id: string;
  inputs?: Array<{ id: string; match?: "exact" | "featured" }>;
  list_price?: UcpPrice;
  media?: UcpMedia[];
  options?: Array<{ label: string; name: string }>;
  price: UcpPrice;
  sku?: string;
  title: string;
  url?: string;
};

export type UcpProduct = {
  categories?: Array<{ value: string }>;
  description: { plain: string };
  handle?: string;
  id: string;
  list_price_range?: { max: UcpPrice; min: UcpPrice };
  media?: UcpMedia[];
  options?: Array<{
    name: string;
    values: Array<{ id?: string; label: string }>;
  }>;
  price_range: { max: UcpPrice; min: UcpPrice };
  selected?: Array<{ label: string; name: string }>;
  title: string;
  url?: string;
  variants: UcpVariant[];
};

export type CatalogSearchResult = {
  messages?: Array<Record<string, unknown>>;
  pagination?: {
    cursor?: string;
    has_next_page: boolean;
    total_count?: number;
  };
  products: UcpProduct[];
};

export type CatalogLookupResult = {
  messages?: Array<Record<string, unknown>>;
  products: UcpProduct[];
};

export type CatalogGetProductResult = {
  messages?: Array<Record<string, unknown>>;
  product: UcpProduct;
} | null;

// ── Service interface ──────────────────────────────────────────

export type UCPService = {
  /**
   * Cancels a checkout session.
   * @link https://ucp.dev/2026-04-08/specification/checkout/#cancel-checkout
   */
  cancelCheckout: (input: { id: string }) => UCPResponse<CheckoutResponse>;
  /**
   * Gets a single product by ID with optional variant selection.
   * @link https://ucp.dev/2026-04-08/specification/catalog/#get-product
   */
  catalogGetProduct: (
    input: CatalogGetProductInput,
  ) => Promise<CatalogGetProductResult>;
  /**
   * Looks up specific products by IDs.
   * @link https://ucp.dev/2026-04-08/specification/catalog/#lookup
   */
  catalogLookup: (input: CatalogLookupInput) => Promise<CatalogLookupResult>;
  /**
   * Searches the product catalog.
   * @link https://ucp.dev/2026-04-08/specification/catalog/#search
   */
  catalogSearch: (input: CatalogSearchInput) => Promise<CatalogSearchResult>;
  /**
   * Completes a checkout session.
   * @link https://ucp.dev/2026-04-08/specification/checkout/#complete-checkout
   */
  completeCheckoutSession: (
    input: CompleteCheckoutRequestWithAp2,
  ) => UCPResponse<CheckoutResponse>;
  /**
   * Creates a checkout session.
   * @link https://ucp.dev/2026-04-08/specification/checkout/#create-checkout
   */
  createCheckoutSession: (
    input: CheckoutCreateRequest,
  ) => UCPResponse<CheckoutResponse>;
  /**
   * Gets the discovery profile.
   * @link https://ucp.dev/2026-04-08/specification/overview/#discovery-governance-and-negotiation
   */
  discoveryProfile: () => UcpDiscoveryProfile;
  /**
   * Gets a checkout session.
   * @link https://ucp.dev/2026-04-08/specification/checkout/#get-checkout
   */
  getCheckoutSession: (input: { id: string }) => UCPResponse<CheckoutResponse>;
  /**
   * Gets an order.
   * @link https://ucp.dev/2026-04-08/specification/order/#get-order
   */
  getOrder: (input: { id: string }) => UCPResponse<UcpOrder>;
  /**
   * Updates a checkout session.
   * @link https://ucp.dev/2026-04-08/specification/checkout/#update-checkout
   */
  updateCheckoutSession: (
    input: CheckoutUpdateRequest,
  ) => UCPResponse<CheckoutResponse>;
};
