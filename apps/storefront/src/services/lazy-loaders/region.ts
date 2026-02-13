import { getCurrentRegion } from "@/foundation/regions";

/**
 * Creates a lazy loader function for the current region.
 * @returns A promise that resolves to the current region instance.
 */
export const createRegionLoader = () => () => getCurrentRegion();
