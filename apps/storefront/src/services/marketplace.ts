import { getServiceRegistry } from "@/services/registry";

export const getMarketplaceService = async () => {
  const serviceRegistry = await getServiceRegistry();

  return serviceRegistry.getMarketplaceService();
};
