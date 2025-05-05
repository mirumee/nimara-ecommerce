import type {
  GetProductRelatedProductsInfra,
  GetProductRelatedProductsUseCase,
} from "#root/store/types";

export const getProductRelatedProductsUseCase = ({
  getProductRelatedProductsInfra,
}: {
  getProductRelatedProductsInfra: GetProductRelatedProductsInfra;
}): GetProductRelatedProductsUseCase => getProductRelatedProductsInfra;
