import type {
  CMSMenuGetInfra,
  CMSMenuGetUseCase,
} from "#root/public/saleor/cms-menu/types";

export const cmsMenuGetUseCase = ({
  cmsMenuGetInfra,
}: {
  cmsMenuGetInfra: CMSMenuGetInfra;
}): CMSMenuGetUseCase => {
  return cmsMenuGetInfra;
};
