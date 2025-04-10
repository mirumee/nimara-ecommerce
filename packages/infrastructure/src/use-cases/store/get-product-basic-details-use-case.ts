import type {
  GetProductBaseInfra,
  GetProductBaseUseCase,
} from "#root/public/saleor/store/types";

export const getProductBaseUseCase = ({
  getProductBaseInfra,
}: {
  getProductBaseInfra: GetProductBaseInfra;
}): GetProductBaseUseCase => getProductBaseInfra;
