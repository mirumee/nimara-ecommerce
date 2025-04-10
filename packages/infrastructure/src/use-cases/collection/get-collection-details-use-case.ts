import {
  type GetCollectionDetailsInfra,
  type GetCollectionDetailsUseCase,
} from "#root/public/saleor/collection/types";

export const getCollectionDetailsUseCase = ({
  getCollectionDetailsInfra,
}: {
  getCollectionDetailsInfra: GetCollectionDetailsInfra;
}): GetCollectionDetailsUseCase => {
  return getCollectionDetailsInfra;
};
