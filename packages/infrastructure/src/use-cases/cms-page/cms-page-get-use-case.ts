import type {
  CMSPageGetInfra,
  CMSPageGetUseCase,
} from "#root/public/saleor/cms-page/types";

export const cmsPageGetUseCase = ({
  cmsPageGetInfra,
}: {
  cmsPageGetInfra: CMSPageGetInfra;
}): CMSPageGetUseCase => {
  return cmsPageGetInfra;
};
