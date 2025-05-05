import {
  type GetCollectionDetailsInfra,
  type GetCollectionDetailsUseCase,
} from "#root/collection/types";

export const getCollectionDetailsUseCase = ({
  getCollectionDetailsInfra,
}: {
  getCollectionDetailsInfra: GetCollectionDetailsInfra;
}): GetCollectionDetailsUseCase => {
  return getCollectionDetailsInfra;
};
