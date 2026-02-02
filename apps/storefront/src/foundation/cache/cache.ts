import { revalidateTag as nextRevalidateTag } from "next/cache";

type Profile = Parameters<typeof nextRevalidateTag>[1];

export const revalidateTag = (
  tag: RevalidateTag,
  profile: Profile = "max",
): void => nextRevalidateTag(tag, profile);
