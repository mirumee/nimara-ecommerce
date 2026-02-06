import {
  delegateToSchema,
  type SubschemaConfig,
} from "@graphql-tools/delegate";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { stitchSchemas } from "@graphql-tools/stitch";
import {
  FilterRootFields,
  FilterTypes,
  PruneSchema,
  schemaFromExecutor,
  TransformRootFields,
} from "@graphql-tools/wrap";
import { GraphQLError, OperationTypeNode, parse } from "graphql";

import type { ServerContext } from "@/lib/saleor/types";

import { requireVendorID } from "./auth";

const MARKETPLACE_CHANNEL =
  process.env.NEXT_PUBLIC_SALEOR_MARKETPLACE_CHANNEL_SLUG || "default-channel";

// Get the default Saleor GraphQL endpoint from environment
function getDefaultSaleorEndpoint(): string {
  const saleorUrl = process.env.NEXT_PUBLIC_SALEOR_URL;

  if (!saleorUrl) {
    throw new Error("NEXT_PUBLIC_SALEOR_URL environment variable is required");
  }
  // Ensure it ends with /graphql/
  if (saleorUrl.endsWith("/graphql/")) {
    return saleorUrl;
  }
  if (saleorUrl.endsWith("/graphql")) {
    return `${saleorUrl}/`;
  }

return saleorUrl.endsWith("/") ? `${saleorUrl}graphql/` : `${saleorUrl}/graphql/`;
}

let cachedSchema: Awaited<ReturnType<typeof makeSaleorSchema>> | null = null;

async function makeSaleorSchema() {
  const defaultEndpoint = getDefaultSaleorEndpoint();

  const executor = buildHTTPExecutor({
    credentials: "include",
    endpoint: defaultEndpoint,
    fetch: async (url, options, context: ServerContext, _info: unknown) => {
      // Determine the actual endpoint based on context
      let actualUrl = url;

      if (context?.appConfig?.saleorDomain) {
        actualUrl = `https://${context.appConfig.saleorDomain}/graphql/`;
      }

      const response = await fetch(actualUrl, options as RequestInit);

      // Proxy Set-Cookie headers
      const cookies = response.headers.getSetCookie?.() || [];

      if (cookies.length > 0 && context?.proxiedCookies) {
        context.proxiedCookies.push(...cookies);
      }

      return response;
    },
    headers: (executorRequest) => {
      const { authToken } = executorRequest?.context?.appConfig ?? {};
      const cookie =
        executorRequest?.context?.request?.headers?.get?.("cookie");

      return {
        Authorization: authToken ? `Bearer ${authToken}` : "",
        ...(cookie ? { Cookie: cookie } : {}),
      };
    },
  });

  return {
    schema: await schemaFromExecutor(executor),
    executor,
    transforms: [
      // Hide Subscription type
      new FilterTypes((type) => type.name !== "Subscription"),

      // Allow only specific root fields
      new FilterRootFields((operationName, fieldName) => {
        if (operationName === "Query") {
          const allowedQueries = [
            "me",
            "categories",
            "channels",
            "collections",
            "order",
            "orders",
            "product",
            "products",
            "productType",
            "productTypes",
            "productVariant",
            "warehouses",
            "user",
          ];


return allowedQueries.includes(fieldName);
        }

        if (operationName === "Mutation") {
          const allowedMutations = [
            "tokenCreate",
            "tokenRefresh",
            "tokenVerify",
            "accountRegister",
            "accountUpdate",
            "confirmAccount",
            "customerUpdate",
            "productBulkCreate",
            "productUpdate",
            "productMediaCreate",
            "productMediaUpdate",
            "productMediaDelete",
            "productMediaReorder",
            "productMediaBulkDelete",
            "productVariantUpdate",
            "productVariantBulkCreate",
            "productChannelListingUpdate",
            "productVariantBulkUpdate",
            "productVariantChannelListingUpdate",
            "orderFulfill",
            "orderCancel",
            "orderFulfillmentCancel",
            "orderNoteAdd",
            "updateMetadata",
          ];


return allowedMutations.includes(fieldName);
        }

        return false;
      }),

      // Remove channel arg from product queries (vendor-specific filtering)
      new TransformRootFields((operationName, fieldName, fieldConfig) => {
        if (operationName === "Query") {
          if (fieldName === "product" || fieldName === "products") {
            delete fieldConfig?.args?.channel;
          }
        }

return fieldConfig;
      }),

      new PruneSchema({}),
    ],
  } as unknown as SubschemaConfig<any, any, any, ServerContext>;
}

async function getSaleorSchema() {
  if (!cachedSchema) {
    cachedSchema = await makeSaleorSchema();
  }

return cachedSchema;
}

export async function getStitchedSchema() {
  const saleorSchema = await getSaleorSchema();

  return stitchSchemas({
    // Cast needed: pnpm resolves two @graphql-tools/delegate versions (10.2.21 vs 10.2.23), so SubschemaConfig types are incompatible at compile time but compatible at runtime.
    subschemas: [saleorSchema] as any,
    typeDefs: `
      extend input AccountInput {
        email: String
      }
    `,
    resolvers: {
      Mutation: {
        accountUpdate: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const vendorId = requireVendorID(context);
            const { input, customerId } = args;

            if (customerId && customerId !== vendorId) {
              throw new GraphQLError("You can only update your own account", {
                extensions: { code: "UNAUTHORIZED" },
              });
            }

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "customerUpdate",
              args: {
                id: customerId || vendorId,
                input,
              },
              context,
              info,
            });
          },
        },
        productUpdate: {
          resolve(_source, args, context: ServerContext, info) {
            requireVendorID(context);

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "productUpdate",
              args,
              context,
              info,
            });
          },
        },
        orderFulfill: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const vendorId = requireVendorID(context);

            // Validate order belongs to vendor
            const orderQuery = parse(`
              query GetOrder($id: ID!) {
                order(id: $id) {
                  id
                  metadata {
                    key
                    value
                  }
                }
              }
            `);

            const orderResult = (await saleorSchema.executor!({
              document: orderQuery,
              variables: { id: args.order },
              context,
            })) as {
              data?: {
                order?: { metadata?: Array<{ key: string; value: string }> };
              };
              errors?: unknown[];
            };

            if (orderResult.errors || !orderResult.data?.order) {
              throw new GraphQLError("Order not found", {
                extensions: { code: "ORDER_NOT_FOUND" },
              });
            }

            const orderMetadata = orderResult.data.order.metadata || [];
            const vendorIdMeta = orderMetadata.find(
              (m) => m.key === "vendor.id",
            );

            if (!vendorIdMeta || vendorIdMeta.value !== vendorId) {
              throw new GraphQLError("Order does not belong to this vendor", {
                extensions: { code: "ORDER_VENDOR_MISMATCH" },
              });
            }

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "orderFulfill",
              args,
              context,
              info,
            });
          },
        },
        orderCancel: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const vendorId = requireVendorID(context);

            const orderQuery = parse(`
              query GetOrder($id: ID!) {
                order(id: $id) {
                  id
                  metadata {
                    key
                    value
                  }
                }
              }
            `);

            const orderResult = (await saleorSchema.executor!({
              document: orderQuery,
              variables: { id: args.id },
              context,
            })) as {
              data?: {
                order?: { metadata?: Array<{ key: string; value: string }> };
              };
              errors?: unknown[];
            };

            if (orderResult.errors || !orderResult.data?.order) {
              throw new GraphQLError("Order not found", {
                extensions: { code: "ORDER_NOT_FOUND" },
              });
            }

            const orderMetadata = orderResult.data.order.metadata || [];
            const vendorIdMeta = orderMetadata.find(
              (m) => m.key === "vendor.id",
            );

            if (!vendorIdMeta || vendorIdMeta.value !== vendorId) {
              throw new GraphQLError("Order does not belong to this vendor", {
                extensions: { code: "ORDER_VENDOR_MISMATCH" },
              });
            }

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "orderCancel",
              args,
              context,
              info,
            });
          },
        },
      },
      Query: {
        me: {
          resolve(_source, _args, context: ServerContext, info) {
            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.QUERY,
              fieldName: "user",
              args: {
                id: context?.vendorId,
              },
              context,
              info,
            });
          },
        },
        product: {
          resolve(_source, args, context: ServerContext, info) {
            requireVendorID(context);
            // Delegate to Saleor; product list is already filtered by vendor so only our products are linked.

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.QUERY,
              fieldName: "product",
              args,
              context,
              info,
            });
          },
        },
        products: {
          resolve(_source, args, context: ServerContext, info) {
            const vendorId = requireVendorID(context);

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.QUERY,
              fieldName: "products",
              args: {
                ...args,
                filter: {
                  metadata: [{ key: "vendor.id", value: vendorId }],
                  ...args.filter,
                },
              },
              context,
              info,
            });
          },
        },
        orders: {
          resolve(_source, args, context: ServerContext, info) {
            const vendorId = requireVendorID(context);

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.QUERY,
              fieldName: "orders",
              args: {
                ...args,
                channel: MARKETPLACE_CHANNEL,
                filter: {
                  metadata: [{ key: "vendor.id", value: vendorId }],
                  ...args.filter,
                },
              },
              context,
              info,
            });
          },
        },
      },
    },
  });
}
