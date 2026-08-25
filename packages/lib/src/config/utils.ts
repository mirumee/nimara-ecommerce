import { humanize } from "#root/utils/string";

// `@nimara/feed-generator` becomes `Feed generator`.
export const getAppDisplayName = (name: string) =>
  humanize(name.split("/").at(-1) ?? "").trim();
