import type {
  GetProductBasicDetailsInfra,
  GetProductBasicDetailsUseCase,
} from "#root/public/saleor/store/types";

export const getProductBasicDetailsUseCase = ({
  getProductBasicDetailsInfra,
}: {
  getProductBasicDetailsInfra: GetProductBasicDetailsInfra;
}): GetProductBasicDetailsUseCase => getProductBasicDetailsInfra;
