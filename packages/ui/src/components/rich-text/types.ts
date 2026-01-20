import { type ComponentPropsWithoutRef } from "react";

import { type Maybe } from "../../lib/types";

export interface RichTextRendererProps
  extends ComponentPropsWithoutRef<"article"> {
  contentData: Maybe<string>;
  disableProse?: boolean;
}
