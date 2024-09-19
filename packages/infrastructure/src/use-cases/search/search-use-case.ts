import type { SearchInfra, SearchUseCase } from "./types";

export const searchUseCase = ({
  searchInfra,
}: {
  searchInfra: SearchInfra;
}): SearchUseCase => {
  return searchInfra;
};
