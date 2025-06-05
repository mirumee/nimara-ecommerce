import { type GetCategoriesIDsBySlugsInfra } from "#root/category/types";

export const getCategoryIDsBySlugsUseCase = ({
  getCategoriesIDsBySlugsInfra,
}: {
  getCategoriesIDsBySlugsInfra: GetCategoriesIDsBySlugsInfra;
}) => {
  return getCategoriesIDsBySlugsInfra;
};
