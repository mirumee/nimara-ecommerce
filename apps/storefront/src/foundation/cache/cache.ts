import { revalidatePath, revalidateTag as nextRevalidateTag } from "next/cache";

import { getLocalizedPath } from "@/foundation/server";

type Profile = Parameters<typeof nextRevalidateTag>[1];

export const revalidateTag = (
  tag: RevalidateTag,
  profile: Profile = "max",
): void => nextRevalidateTag(tag, profile);

/**
 * Revalidates a path, prefixing it with the current locale so non-default
 * channels (e.g. "/gb") revalidate the route they actually rendered.
 */
export const revalidateLocalizedPath = async (
  path: string,
  type?: Parameters<typeof revalidatePath>[1],
): Promise<void> => revalidatePath(await getLocalizedPath(path), type);
