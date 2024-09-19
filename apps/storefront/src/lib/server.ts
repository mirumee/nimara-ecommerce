import { headers } from "next/headers";

export const getStoreUrl = () =>
  `${headers().get("x-forwarded-proto")}://${headers().get(
    "x-forwarded-host",
  )}`;
