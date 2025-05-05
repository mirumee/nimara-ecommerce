import type {
  GetProductBaseInfra,
  GetProductBaseUseCase,
} from "#root/store/types";

export const getProductBaseUseCase = ({
  getProductBaseInfra,
}: {
  getProductBaseInfra: GetProductBaseInfra;
}): GetProductBaseUseCase => getProductBaseInfra;
