import { headers } from "next/headers";

export const getStoreUrl = async () =>
  `${(await headers()).get("x-forwarded-proto")}://${(await headers()).get(
    "x-forwarded-host",
  )}`;
