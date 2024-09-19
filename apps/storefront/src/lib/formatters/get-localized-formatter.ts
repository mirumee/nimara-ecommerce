import { getCurrentRegion } from "@/regions/server";

import { localizedFormatter } from "./util";

export const getLocalizedFormatter = async () => {
  const region = await getCurrentRegion();

  return localizedFormatter({ region });
};
