import type { SaleorAppConfig } from "./app-config";

/** App manifest extension */
export interface SaleorAppManifestExtension {
  label: string;
  mount: string;
  options?: { newTabTarget?: { method: "GET" | "POST" } };
  permissions: string[];
  target: string;
  url: string;
}

/**
 * Saleor App Manifest structure
 */
export interface SaleorAppManifest {
  about?: string;
  appUrl: string;
  author?: string;
  brand?: {
    logo?: {
      default?: string;
    };
  };
  extensions?: SaleorAppManifestExtension[];
  id: string;
  name: string;
  permissions: string[];
  tokenTargetUrl: string;
  version: string;
  webhooks?: SaleorWebhookManifest[];
}

/**
 * Webhook manifest structure
 */
export interface SaleorWebhookManifest {
  asyncEvents: string[];
  name: string;
  query: string;
  syncEvents?: string[];
  targetUrl: string;
}

/**
 * Saleor JWT payload structure
 */
export interface SaleorJWTPayload {
  email?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  type?: string;
  user_id: string;
}

/**
 * GraphQL Server Context
 */
export interface ServerContext {
  appConfig?: SaleorAppConfig;
  proxiedCookies: string[];
  request: Request;
  saleorDomain?: string;
  /** Saleor User ID – for me, accountUpdate, etc. */
  userId?: string;
  /** Vendor Profile Page ID – canonical vendor identifier for products, orders */
  vendorId?: string;
}

/**
 * Saleor webhook headers
 */
export interface SaleorWebhookHeaders {
  "saleor-api-url": string;
  "saleor-domain": string;
  "saleor-event": string;
  "saleor-signature": string;
}

/**
 * GraphQL authorization levels
 */
export enum GraphQLAuthLevel {
  /** Uses app token when x-saleor-domain present (dashboard context, no user JWT) */
  APP_TOKEN_ONLY = "APP_TOKEN_ONLY",
  AUTHENTICATED = "AUTHENTICATED",
  DOMAIN_ONLY = "DOMAIN_ONLY",
  PUBLIC = "PUBLIC",
}
