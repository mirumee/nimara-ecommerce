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

import { DEFAULT_CHANNEL_SLUG } from "@nimara/domain/consts";

import { METADATA_KEYS } from "@/lib/saleor/consts";
import type { ServerContext } from "@/lib/saleor/types";

import { requireVendorID } from "./auth";

const MARKETPLACE_CHANNEL =
  process.env.NEXT_PUBLIC_SALEOR_MARKETPLACE_CHANNEL_SLUG ||
  DEFAULT_CHANNEL_SLUG;

function withVendorMetadata<
  T extends { metadata?: Array<{ key: string; value: string }> },
>(input: T, vendorId: string): T {
  const metadata = Array.isArray(input.metadata) ? [...input.metadata] : [];
  const withoutVendor = metadata.filter(
    (m) => m.key !== METADATA_KEYS.VENDOR_ID,
  );

  return {
    ...input,
    metadata: [
      ...withoutVendor,
      { key: METADATA_KEYS.VENDOR_ID, value: vendorId },
    ],
  };
}

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

  return saleorUrl.endsWith("/")
    ? `${saleorUrl}graphql/`
    : `${saleorUrl}/graphql/`;
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
            "channel",
            "channels",
            "checkout",
            "collection",
            "collections",
            "customers",
            "draftOrders",
            "order",
            "orders",
            "page",
            "pages",
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
            "draftOrderCreate",
            "draftOrderUpdate",
            "draftOrderComplete",
            "draftOrderDelete",
            "orderUpdate",
            "orderLinesCreate",
            "orderLineUpdate",
            "orderLineDelete",
            "orderDiscountAdd",
            "orderDiscountUpdate",
            "orderDiscountDelete",
            "productBulkCreate",
            "productCreate",
            "productUpdate",
            "productDelete",
            "productMediaCreate",
            "productMediaUpdate",
            "productMediaDelete",
            "productMediaReorder",
            "productMediaBulkDelete",
            "productVariantUpdate",
            "productVariantCreate",
            "productVariantDelete",
            "productVariantBulkCreate",
            "productChannelListingUpdate",
            "productVariantBulkUpdate",
            "productVariantChannelListingUpdate",
            "orderFulfill",
            "orderCancel",
            "orderMarkAsPaid",
            "orderFulfillmentCancel",
            "orderNoteAdd",
            "pageUpdate",
            "updateMetadata",
            "collectionCreate",
            "collectionUpdate",
            "collectionChannelListingUpdate",
            "collectionDelete",
            "collectionAddProducts",
            "collectionRemoveProducts",
            "checkoutComplete",
            "transactionCreate",
          ];

          return allowedMutations.includes(fieldName);
        }

        return false;
      }),

      // Remove channel arg from product/collection queries (vendor-specific filtering)
      new TransformRootFields((operationName, fieldName, fieldConfig) => {
        if (operationName === "Query") {
          if (
            fieldName === "product" ||
            fieldName === "products" ||
            fieldName === "collection" ||
            fieldName === "collections"
          ) {
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
      extend type Query {
        vendorProfiles(
          first: Int
          last: Int
          after: String
          before: String
          filter: PageFilterInput
          sortBy: PageSortingInput
        ): PageCountableConnection
      }
    `,
    resolvers: {
      Mutation: {
        accountUpdate: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const userId = context.userId;

            if (!userId) {
              throw new GraphQLError("Authentication required.", {
                extensions: { code: "UNAUTHORIZED" },
              });
            }
            const { input, customerId } = args;

            if (customerId && customerId !== userId) {
              throw new GraphQLError("You can only update your own account", {
                extensions: { code: "UNAUTHORIZED" },
              });
            }

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "customerUpdate",
              args: {
                id: customerId || userId,
                input,
              },
              context,
              info,
            });
          },
        },
        draftOrderCreate: {
          resolve(_source, args, context: ServerContext, info) {
            const vendorId = requireVendorID(context);
            const input = args?.input
              ? withVendorMetadata(args.input, vendorId)
              : args?.input;

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "draftOrderCreate",
              args: { ...args, input },
              context,
              info,
            });
          },
        },
        draftOrderUpdate: {
          resolve(_source, args, context: ServerContext, info) {
            const vendorId = requireVendorID(context);
            const input = args?.input
              ? withVendorMetadata(args.input, vendorId)
              : args?.input;

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "draftOrderUpdate",
              args: { ...args, input },
              context,
              info,
            });
          },
        },
        draftOrderComplete: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const vendorId = requireVendorID(context);

            const result = (await delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "draftOrderComplete",
              args,
              context,
              info,
            })) as {
              data?: {
                draftOrderComplete?: {
                  errors?: Array<{ message?: string | null }>;
                  order?: { id?: string } | null;
                };
              };
              errors?: ReadonlyArray<{ message?: string }>;
            };

            if (result.errors?.length) {
              return result;
            }

            const payload = result.data?.draftOrderComplete;

            if (!payload?.order?.id || (payload.errors?.length ?? 0) > 0) {
              return result;
            }

            const updateMetaDoc = parse(`
              mutation EnsureOrderVendorMetadata($id: ID!, $input: [MetadataInput!]!) {
                updateMetadata(id: $id, input: $input) {
                  errors {
                    field
                    message
                    code
                  }
                }
              }
            `);

            const metaResult = (await saleorSchema.executor!({
              document: updateMetaDoc,
              variables: {
                id: payload.order.id,
                input: [{ key: METADATA_KEYS.VENDOR_ID, value: vendorId }],
              },
              context,
            })) as {
              data?: {
                updateMetadata?: {
                  errors?: Array<{ message?: string | null }>;
                };
              };
              errors?: ReadonlyArray<{ message?: string }>;
            };

            if (
              metaResult.errors?.length ||
              (metaResult.data?.updateMetadata?.errors?.length ?? 0) > 0
            ) {
              console.error(
                "[draftOrderComplete] Failed to set vendor.id on order (order-created webhook can still fix)",
                {
                  errors:
                    metaResult.errors ??
                    metaResult.data?.updateMetadata?.errors,
                  orderId: payload.order.id,
                },
              );
            }

            return result;
          },
        },
        orderUpdate: {
          resolve(_source, args, context: ServerContext, info) {
            const vendorId = requireVendorID(context);
            const input = args?.input
              ? withVendorMetadata(args.input, vendorId)
              : args?.input;

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "orderUpdate",
              args: { ...args, input },
              context,
              info,
            });
          },
        },
        productBulkCreate: {
          resolve(_source, args, context: ServerContext, info) {
            const vendorId = requireVendorID(context);
            const products = (args?.products ?? []).map((p: any) =>
              withVendorMetadata(p, vendorId),
            );

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "productBulkCreate",
              args: { ...args, products },
              context,
              info,
            });
          },
        },
        productCreate: {
          resolve(_source, args, context: ServerContext, info) {
            const vendorId = requireVendorID(context);
            const input = args?.input
              ? withVendorMetadata(args.input, vendorId)
              : args?.input;

            if (process.env.NODE_ENV === "development") {
              console.debug(
                "[productCreate] vendorId:",
                vendorId,
                "metadata:",
                input?.metadata,
              );
            }

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "productCreate",
              args: { ...args, input },
              context,
              info,
            });
          },
        },
        productUpdate: {
          resolve(_source, args, context: ServerContext, info) {
            const vendorId = requireVendorID(context);
            const input = args?.input
              ? withVendorMetadata(args.input, vendorId)
              : args?.input;

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "productUpdate",
              args: { ...args, input },
              context,
              info,
            });
          },
        },
        productDelete: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const vendorId = requireVendorID(context);

            const productQuery = parse(`
              query GetProduct($id: ID!) {
                product(id: $id) {
                  id
                  metadata {
                    key
                    value
                  }
                }
              }
            `);

            const productResult = (await saleorSchema.executor!({
              document: productQuery,
              variables: { id: args.id },
              context,
            })) as {
              data?: {
                product?: {
                  metadata?: Array<{ key: string; value: string }>;
                };
              };
              errors?: unknown[];
            };

            if (productResult.errors || !productResult.data?.product) {
              throw new GraphQLError("Product not found", {
                extensions: { code: "PRODUCT_NOT_FOUND" },
              });
            }

            const productMetadata = productResult.data.product.metadata || [];
            const vendorIdMeta = productMetadata.find(
              (m) => m.key === "vendor.id",
            );

            if (!vendorIdMeta || vendorIdMeta.value !== vendorId) {
              throw new GraphQLError("Product does not belong to this vendor", {
                extensions: { code: "PRODUCT_VENDOR_MISMATCH" },
              });
            }

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "productDelete",
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
        orderMarkAsPaid: {
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
              fieldName: "orderMarkAsPaid",
              args,
              context,
              info,
            });
          },
        },
        collectionCreate: {
          resolve(_source, args, context: ServerContext, info) {
            const vendorId = requireVendorID(context);
            const input = args?.input
              ? withVendorMetadata(args.input, vendorId)
              : args?.input;

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "collectionCreate",
              args: { ...args, input },
              context,
              info,
            });
          },
        },
        collectionUpdate: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const vendorId = requireVendorID(context);

            const collectionQuery = parse(`
              query GetCollection($id: ID!) {
                collection(id: $id) {
                  id
                  metadata {
                    key
                    value
                  }
                }
              }
            `);

            const collectionResult = (await saleorSchema.executor!({
              document: collectionQuery,
              variables: { id: args.id },
              context,
            })) as {
              data?: {
                collection?: {
                  metadata?: Array<{ key: string; value: string }>;
                };
              };
              errors?: unknown[];
            };

            if (collectionResult.errors || !collectionResult.data?.collection) {
              throw new GraphQLError("Collection not found", {
                extensions: { code: "COLLECTION_NOT_FOUND" },
              });
            }

            const collectionMetadata =
              collectionResult.data.collection.metadata || [];
            const vendorIdMeta = collectionMetadata.find(
              (m) => m.key === "vendor.id",
            );

            if (!vendorIdMeta || vendorIdMeta.value !== vendorId) {
              throw new GraphQLError(
                "Collection does not belong to this vendor",
                { extensions: { code: "COLLECTION_VENDOR_MISMATCH" } },
              );
            }

            const input = args?.input
              ? withVendorMetadata(args.input, vendorId)
              : args?.input;

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "collectionUpdate",
              args: { ...args, input },
              context,
              info,
            });
          },
        },
        collectionChannelListingUpdate: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const vendorId = requireVendorID(context);

            const collectionQuery = parse(`
              query GetCollection($id: ID!) {
                collection(id: $id) {
                  id
                  metadata {
                    key
                    value
                  }
                }
              }
            `);

            const collectionResult = (await saleorSchema.executor!({
              document: collectionQuery,
              variables: { id: args.id },
              context,
            })) as {
              data?: {
                collection?: {
                  metadata?: Array<{ key: string; value: string }>;
                };
              };
              errors?: unknown[];
            };

            if (collectionResult.errors || !collectionResult.data?.collection) {
              throw new GraphQLError("Collection not found", {
                extensions: { code: "COLLECTION_NOT_FOUND" },
              });
            }

            const collectionMetadata =
              collectionResult.data.collection.metadata || [];
            const vendorIdMeta = collectionMetadata.find(
              (m) => m.key === "vendor.id",
            );

            if (!vendorIdMeta || vendorIdMeta.value !== vendorId) {
              throw new GraphQLError(
                "Collection does not belong to this vendor",
                { extensions: { code: "COLLECTION_VENDOR_MISMATCH" } },
              );
            }

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "collectionChannelListingUpdate",
              args,
              context,
              info,
            });
          },
        },
        collectionDelete: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const vendorId = requireVendorID(context);

            const collectionQuery = parse(`
              query GetCollection($id: ID!) {
                collection(id: $id) {
                  id
                  metadata {
                    key
                    value
                  }
                }
              }
            `);

            const collectionResult = (await saleorSchema.executor!({
              document: collectionQuery,
              variables: { id: args.id },
              context,
            })) as {
              data?: {
                collection?: {
                  metadata?: Array<{ key: string; value: string }>;
                };
              };
              errors?: unknown[];
            };

            if (collectionResult.errors || !collectionResult.data?.collection) {
              throw new GraphQLError("Collection not found", {
                extensions: { code: "COLLECTION_NOT_FOUND" },
              });
            }

            const collectionMetadata =
              collectionResult.data.collection.metadata || [];
            const vendorIdMeta = collectionMetadata.find(
              (m) => m.key === "vendor.id",
            );

            if (!vendorIdMeta || vendorIdMeta.value !== vendorId) {
              throw new GraphQLError(
                "Collection does not belong to this vendor",
                { extensions: { code: "COLLECTION_VENDOR_MISMATCH" } },
              );
            }

            // Prevent deletion of default collections (created during vendor sign-up)
            const defaultCollectionMeta = collectionMetadata.find(
              (m) => m.key === METADATA_KEYS.VENDOR_DEFAULT_COLLECTION,
            );

            if (defaultCollectionMeta?.value === "true") {
              throw new GraphQLError(
                "Cannot delete default collection. This collection was created during sign-up and is required.",
                { extensions: { code: "DEFAULT_COLLECTION_DELETE_FORBIDDEN" } },
              );
            }

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "collectionDelete",
              args,
              context,
              info,
            });
          },
        },
        collectionAddProducts: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const vendorId = requireVendorID(context);

            const collectionQuery = parse(`
              query GetCollection($id: ID!) {
                collection(id: $id) {
                  id
                  metadata {
                    key
                    value
                  }
                }
              }
            `);

            const collectionResult = (await saleorSchema.executor!({
              document: collectionQuery,
              variables: { id: args.collectionId },
              context,
            })) as {
              data?: {
                collection?: {
                  metadata?: Array<{ key: string; value: string }>;
                };
              };
              errors?: unknown[];
            };

            if (collectionResult.errors || !collectionResult.data?.collection) {
              throw new GraphQLError("Collection not found", {
                extensions: { code: "COLLECTION_NOT_FOUND" },
              });
            }

            const collectionMetadata =
              collectionResult.data.collection.metadata || [];
            const vendorIdMeta = collectionMetadata.find(
              (m) => m.key === "vendor.id",
            );

            if (!vendorIdMeta || vendorIdMeta.value !== vendorId) {
              throw new GraphQLError(
                "Collection does not belong to this vendor",
                { extensions: { code: "COLLECTION_VENDOR_MISMATCH" } },
              );
            }

            // Verify all products belong to this vendor before adding
            const productIds = args.products || [];

            if (productIds.length > 0) {
              const productQuery = parse(`
                query GetProducts($ids: [ID!]!) {
                  products(filter: { ids: $ids }, first: ${productIds.length}) {
                    edges {
                      node {
                        id
                        metadata {
                          key
                          value
                        }
                      }
                    }
                  }
                }
              `);

              const productResult = (await saleorSchema.executor!({
                document: productQuery,
                variables: { ids: productIds },
                context,
              })) as {
                data?: {
                  products?: {
                    edges?: Array<{
                      node?: {
                        id: string;
                        metadata?: Array<{ key: string; value: string }>;
                      };
                    }>;
                  };
                };
                errors?: unknown[];
              };

              if (productResult.errors) {
                throw new GraphQLError("Failed to verify product ownership", {
                  extensions: { code: "PRODUCT_VERIFICATION_FAILED" },
                });
              }

              const productNodes =
                productResult.data?.products?.edges
                  ?.map((e) => e.node)
                  .filter(
                    (
                      node,
                    ): node is {
                      id: string;
                      metadata?: Array<{ key: string; value: string }>;
                    } => node != null,
                  ) ?? [];

              // Check if all requested products were found
              if (productNodes.length !== productIds.length) {
                throw new GraphQLError("One or more products not found", {
                  extensions: { code: "PRODUCT_NOT_FOUND" },
                });
              }

              // Verify each product belongs to this vendor
              for (const product of productNodes) {
                const productMetadata = product.metadata || [];
                const productVendorIdMeta = productMetadata.find(
                  (m) => m.key === "vendor.id",
                );

                if (
                  !productVendorIdMeta ||
                  productVendorIdMeta.value !== vendorId
                ) {
                  throw new GraphQLError(
                    `Product ${product.id} does not belong to this vendor`,
                    { extensions: { code: "PRODUCT_VENDOR_MISMATCH" } },
                  );
                }
              }
            }

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "collectionAddProducts",
              args,
              context,
              info,
            });
          },
        },
        collectionRemoveProducts: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const vendorId = requireVendorID(context);

            const collectionQuery = parse(`
              query GetCollection($id: ID!) {
                collection(id: $id) {
                  id
                  metadata {
                    key
                    value
                  }
                }
              }
            `);

            const collectionResult = (await saleorSchema.executor!({
              document: collectionQuery,
              variables: { id: args.collectionId },
              context,
            })) as {
              data?: {
                collection?: {
                  metadata?: Array<{ key: string; value: string }>;
                };
              };
              errors?: unknown[];
            };

            if (collectionResult.errors || !collectionResult.data?.collection) {
              throw new GraphQLError("Collection not found", {
                extensions: { code: "COLLECTION_NOT_FOUND" },
              });
            }

            const collectionMetadata =
              collectionResult.data.collection.metadata || [];
            const vendorIdMeta = collectionMetadata.find(
              (m) => m.key === "vendor.id",
            );

            if (!vendorIdMeta || vendorIdMeta.value !== vendorId) {
              throw new GraphQLError(
                "Collection does not belong to this vendor",
                { extensions: { code: "COLLECTION_VENDOR_MISMATCH" } },
              );
            }

            // Verify all products belong to this vendor before removing
            const productIds = args.products || [];

            if (productIds.length > 0) {
              const productQuery = parse(`
                query GetProducts($ids: [ID!]!) {
                  products(filter: { ids: $ids }, first: ${productIds.length}) {
                    edges {
                      node {
                        id
                        metadata {
                          key
                          value
                        }
                      }
                    }
                  }
                }
              `);

              const productResult = (await saleorSchema.executor!({
                document: productQuery,
                variables: { ids: productIds },
                context,
              })) as {
                data?: {
                  products?: {
                    edges?: Array<{
                      node?: {
                        id: string;
                        metadata?: Array<{ key: string; value: string }>;
                      };
                    }>;
                  };
                };
                errors?: unknown[];
              };

              if (productResult.errors) {
                throw new GraphQLError("Failed to verify product ownership", {
                  extensions: { code: "PRODUCT_VERIFICATION_FAILED" },
                });
              }

              const productNodes =
                productResult.data?.products?.edges
                  ?.map((e) => e.node)
                  .filter(
                    (
                      node,
                    ): node is {
                      id: string;
                      metadata?: Array<{ key: string; value: string }>;
                    } => node != null,
                  ) ?? [];

              // Check if all requested products were found
              if (productNodes.length !== productIds.length) {
                throw new GraphQLError("One or more products not found", {
                  extensions: { code: "PRODUCT_NOT_FOUND" },
                });
              }

              // Verify each product belongs to this vendor
              for (const product of productNodes) {
                const productMetadata = product.metadata || [];
                const productVendorIdMeta = productMetadata.find(
                  (m) => m.key === "vendor.id",
                );

                if (
                  !productVendorIdMeta ||
                  productVendorIdMeta.value !== vendorId
                ) {
                  throw new GraphQLError(
                    `Product ${product.id} does not belong to this vendor`,
                    { extensions: { code: "PRODUCT_VENDOR_MISMATCH" } },
                  );
                }
              }
            }

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.MUTATION,
              fieldName: "collectionRemoveProducts",
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
                id: context?.userId,
              },
              context,
              info,
            });
          },
        },
        product: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const vendorId = requireVendorID(context);

            const productQuery = parse(`
              query GetProduct($id: ID!) {
                product(id: $id) {
                  id
                  metadata {
                    key
                    value
                  }
                }
              }
            `);

            const productResult = (await saleorSchema.executor!({
              document: productQuery,
              variables: { id: args.id },
              context,
            })) as {
              data?: {
                product?: {
                  id: string;
                  metadata?: Array<{ key: string; value: string }>;
                };
              };
              errors?: unknown[];
            };

            if (productResult.errors || !productResult.data?.product) {
              // Don't pass channel: Saleor returns null for products without channel listing when channel is set.
              return delegateToSchema({
                schema: saleorSchema,
                operation: OperationTypeNode.QUERY,
                fieldName: "product",
                args,
                context,
                info,
              });
            }

            const productMetadata = productResult.data.product.metadata || [];
            const vendorIdMeta = productMetadata.find(
              (m) => m.key === "vendor.id",
            );

            if (!vendorIdMeta || vendorIdMeta.value !== vendorId) {
              throw new GraphQLError("Product does not belong to this vendor", {
                extensions: { code: "PRODUCT_VENDOR_MISMATCH" },
              });
            }

            // Don't pass channel: Saleor returns null for products without channel listing when channel is set.
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
        productVariant: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const vendorId = requireVendorID(context);

            const productVariantQuery = parse(`
              query GetProductVariantVendor($id: ID!) {
                productVariant(id: $id) {
                  id
                  product {
                    id
                    metadata {
                      key
                      value
                    }
                  }
                }
              }
            `);

            const productVariantResult = (await saleorSchema.executor!({
              document: productVariantQuery,
              variables: { id: args.id },
              context,
            })) as {
              data?: {
                productVariant?: {
                  id: string;
                  product?: {
                    id: string;
                    metadata?: Array<{ key: string; value: string }>;
                  } | null;
                };
              };
              errors?: unknown[];
            };

            if (
              productVariantResult.errors ||
              !productVariantResult.data?.productVariant
            ) {
              return delegateToSchema({
                schema: saleorSchema,
                operation: OperationTypeNode.QUERY,
                fieldName: "productVariant",
                args,
                context,
                info,
              });
            }

            const productMetadata =
              productVariantResult.data.productVariant.product?.metadata || [];
            const vendorIdMeta = productMetadata.find(
              (m) => m.key === "vendor.id",
            );

            if (!vendorIdMeta || vendorIdMeta.value !== vendorId) {
              throw new GraphQLError(
                "Product variant does not belong to this vendor",
                { extensions: { code: "PRODUCT_VARIANT_VENDOR_MISMATCH" } },
              );
            }

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.QUERY,
              fieldName: "productVariant",
              args,
              context,
              info,
            });
          },
        },
        products: {
          resolve(_source, args, context: ServerContext, info) {
            const vendorId = requireVendorID(context);

            const existingMetadata = args.filter?.metadata || [];
            const vendorMetadata = { key: "vendor.id", value: vendorId };

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.QUERY,
              fieldName: "products",
              args: {
                ...args,
                // Don't pass channel: Saleor returns only products with channel listing when channel is set.
                // Omitting channel includes products without channel listings (vendor can see them and add channels).
                filter: {
                  ...args.filter,
                  metadata: [...existingMetadata, vendorMetadata],
                },
              },
              context,
              info,
            });
          },
        },
        customers: {
          resolve(_source, args, context: ServerContext, info) {
            // No requireVendorID: allowed via APP_TOKEN_ONLY (dashboard context) or user JWT
            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.QUERY,
              fieldName: "customers",
              args,
              context,
              info,
            });
          },
        },
        vendorProfiles: {
          resolve(_source, args, context: ServerContext, info) {
            const pageTypeId = context.appConfig?.config
              ? (
                  context.appConfig.config as {
                    vendorProfilePageTypeId?: string;
                  }
                ).vendorProfilePageTypeId
              : undefined;

            if (!pageTypeId) {
              throw new GraphQLError(
                "Vendor profile model not configured. Run setup first.",
                { extensions: { code: "CONFIG_MISSING" } },
              );
            }

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.QUERY,
              fieldName: "pages",
              args: {
                ...args,
                filter: {
                  pageTypes: [pageTypeId],
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

            const existingMetadata = args.filter?.metadata || [];
            const vendorMetadata = { key: "vendor.id", value: vendorId };

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.QUERY,
              fieldName: "orders",
              args: {
                ...args,
                channel: MARKETPLACE_CHANNEL,
                filter: {
                  ...args.filter,
                  metadata: [...existingMetadata, vendorMetadata],
                },
              },
              context,
              info,
            });
          },
        },
        draftOrders: {
          resolve(_source, args, context: ServerContext, info) {
            const vendorId = requireVendorID(context);

            const existingMetadata = args.filter?.metadata || [];
            const vendorMetadata = { key: "vendor.id", value: vendorId };

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.QUERY,
              fieldName: "draftOrders",
              args: {
                ...args,
                filter: {
                  ...args.filter,
                  metadata: [...existingMetadata, vendorMetadata],
                },
              },
              context,
              info,
            });
          },
        },
        order: {
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
              return delegateToSchema({
                schema: saleorSchema,
                operation: OperationTypeNode.QUERY,
                fieldName: "order",
                args,
                context,
                info,
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
              operation: OperationTypeNode.QUERY,
              fieldName: "order",
              args,
              context,
              info,
            });
          },
        },
        collections: {
          resolve(_source, args, context: ServerContext, info) {
            const vendorId = requireVendorID(context);

            const existingMetadata = args.filter?.metadata || [];
            const vendorMetadata = { key: "vendor.id", value: vendorId };

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.QUERY,
              fieldName: "collections",
              args: {
                ...args,
                filter: {
                  ...args.filter,
                  metadata: [...existingMetadata, vendorMetadata],
                },
              },
              context,
              info,
            });
          },
        },
        collection: {
          resolve: async (_source, args, context: ServerContext, info) => {
            const vendorId = requireVendorID(context);

            const collectionQuery = parse(`
              query GetCollection($id: ID!) {
                collection(id: $id) {
                  id
                  metadata {
                    key
                    value
                  }
                }
              }
            `);

            const collectionResult = (await saleorSchema.executor!({
              document: collectionQuery,
              variables: { id: args.id },
              context,
            })) as {
              data?: {
                collection?: {
                  id: string;
                  metadata?: Array<{ key: string; value: string }>;
                };
              };
              errors?: unknown[];
            };

            if (collectionResult.errors || !collectionResult.data?.collection) {
              return delegateToSchema({
                schema: saleorSchema,
                operation: OperationTypeNode.QUERY,
                fieldName: "collection",
                args,
                context,
                info,
              });
            }

            const collectionMetadata =
              collectionResult.data.collection.metadata || [];
            const vendorIdMeta = collectionMetadata.find(
              (m) => m.key === "vendor.id",
            );

            if (!vendorIdMeta || vendorIdMeta.value !== vendorId) {
              throw new GraphQLError(
                "Collection does not belong to this vendor",
                { extensions: { code: "COLLECTION_VENDOR_MISMATCH" } },
              );
            }

            return delegateToSchema({
              schema: saleorSchema,
              operation: OperationTypeNode.QUERY,
              fieldName: "collection",
              args,
              context,
              info,
            });
          },
        },
      },
    },
  });
}
