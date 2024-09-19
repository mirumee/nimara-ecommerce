import type { Attribute } from "./Attribute";

export type CMSPage = {
  attributes: Attribute[];
  content: string | null;
  title: string;
};
