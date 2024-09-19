import { type Maybe } from "./types";

export const getTranslation = <T, K extends keyof T>(
  key: K,
  type: Maybe<
    {
      [key in K]?: Maybe<string>;
    } & { translation?: Maybe<{ [key in K]?: Maybe<string> }> }
  >,
) => type?.translation?.[key] || type?.[key] || "";
