import type { CMSMenuGetInfra, CMSMenuGetUseCase } from "./types";

export const cmsMenuGetUseCase = ({
  cmsMenuGetInfra,
}: {
  cmsMenuGetInfra: CMSMenuGetInfra;
}): CMSMenuGetUseCase => {
  return cmsMenuGetInfra;
};
