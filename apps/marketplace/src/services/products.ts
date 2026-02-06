import type { AsyncResult } from "@nimara/domain/objects/Result";

import {
  type Product,
  ProductDocument,
  type Products,
  ProductsDocument,
  type ProductsVariables,
  type ProductVariables,
} from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";

/**
 * Service for marketplace product operations.
 * Handles product listing and detail queries.
 */
class ProductsService {
  async getProducts(
    variables?: ProductsVariables,
    token?: string | null,
  ): AsyncResult<Products> {
    return executeGraphQL(ProductsDocument, "ProductsQuery", variables, token);
  }

  async getProduct(
    variables: ProductVariables,
    token?: string | null,
  ): AsyncResult<Product> {
    return executeGraphQL(ProductDocument, "ProductQuery", variables, token);
  }
}

export const productsService = new ProductsService();
