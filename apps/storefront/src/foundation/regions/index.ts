import { createRegions } from "@nimara/foundation/regions/create-regions";

import { REGIONS_CONFIG } from "./config";

export const { getCurrentRegion } = createRegions(REGIONS_CONFIG);

export { useCurrentRegion } from "./use-current-region";
