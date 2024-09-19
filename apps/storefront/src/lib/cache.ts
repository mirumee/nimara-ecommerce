import { revalidateTag as nextRevalidateTag } from "next/cache";

export const revalidateTag = (tag: RevalidateTag): void =>
  nextRevalidateTag(tag);
