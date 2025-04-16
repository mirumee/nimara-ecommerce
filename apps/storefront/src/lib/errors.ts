import { type Maybe } from "./types";

const GLOBAL_ERROR_FIELDS = ["checkout", "id"] as const;

export const isGlobalError = (field: Maybe<string>) =>
  !field || GLOBAL_ERROR_FIELDS.includes(field);
