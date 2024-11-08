import type { CMSPageGetInfra, CMSPageGetUseCase } from "./types";

export const cmsPageGetUseCase = ({
  cmsPageGetInfra,
}: {
  cmsPageGetInfra: CMSPageGetInfra;
}): CMSPageGetUseCase => {
  return cmsPageGetInfra;
};
