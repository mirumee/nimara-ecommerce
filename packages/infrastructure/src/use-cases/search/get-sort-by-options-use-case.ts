import type { GetSortByOptionsInfra, GetSortByOptionsUseCase } from "./types";

export const getSortByOptionsUseCase = ({
  getSortByOptionsInfra,
}: {
  getSortByOptionsInfra: GetSortByOptionsInfra;
}): GetSortByOptionsUseCase => {
  return getSortByOptionsInfra;
};
