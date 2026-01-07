import { getCurrentRegion } from "@/foundation/regions";

import { localizedFormatter } from "./util";

export const getLocalizedFormatter = async () => {
  const region = await getCurrentRegion();

  return localizedFormatter({ region });
};
