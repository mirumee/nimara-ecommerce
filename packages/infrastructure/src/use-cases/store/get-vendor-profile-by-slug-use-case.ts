import type {
  GetVendorProfileBySlugInfra,
  GetVendorProfileBySlugUseCase,
} from "#root/store/types";

export const getVendorProfileBySlugUseCase = ({
  getVendorProfileBySlugInfra,
}: {
  getVendorProfileBySlugInfra: GetVendorProfileBySlugInfra;
}): GetVendorProfileBySlugUseCase => getVendorProfileBySlugInfra;
