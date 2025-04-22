import { type ComponentProps } from "react";

import { type Maybe } from "../../lib/types";

export interface RichTextRendererProps extends ComponentProps<"article"> {
  contentData: Maybe<string>;
  disableProse?: boolean;
}
