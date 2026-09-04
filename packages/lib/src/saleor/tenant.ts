/**
 * The Saleor installation a caller proved it belongs to. Established by a
 * middleware that verified a signature against that installation's JWKS —
 * see `@nimara/lib/hono/saleor/tenant`.
 */
export type SaleorTenant = {
  saleorApiUrl: string;
  saleorDomain: string;
};
