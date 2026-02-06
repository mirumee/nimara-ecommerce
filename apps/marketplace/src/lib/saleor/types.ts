import type { SaleorAppConfig } from "./app-config";

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
  AUTHENTICATED = "AUTHENTICATED",
  DOMAIN_ONLY = "DOMAIN_ONLY",
  PUBLIC = "PUBLIC",
}
