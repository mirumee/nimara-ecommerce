import type {
  GetProductRelatedProductsInfra,
  GetProductRelatedProductsUseCase,
} from "#root/public/saleor/store/types";

export const getProductRelatedProductsUseCase = ({
  getProductRelatedProductsInfra,
}: {
  getProductRelatedProductsInfra: GetProductRelatedProductsInfra;
}): GetProductRelatedProductsUseCase => getProductRelatedProductsInfra;
