import type { GetFacetsInfra, GetFacetsUseCase } from "./types";

export const getFacetsUseCase = ({
  facetsInfra,
}: {
  facetsInfra: GetFacetsInfra;
}): GetFacetsUseCase => {
  return facetsInfra;
};
