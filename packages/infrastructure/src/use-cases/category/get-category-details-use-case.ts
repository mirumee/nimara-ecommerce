import {
  type GetCategoryDetailsInfra,
  type GetCategoryDetailsUseCase,
} from "#root/category/types";

export const getCategoryDetailsUseCase = ({
  getCategoryDetailsInfra,
}: {
  getCategoryDetailsInfra: GetCategoryDetailsInfra;
}): GetCategoryDetailsUseCase => {
  return getCategoryDetailsInfra;
};
