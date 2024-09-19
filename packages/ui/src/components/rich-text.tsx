import EditorJSHTML from "editorjs-html";
import { type ComponentProps } from "react";

import { parseEditorJSData } from "../lib/richText";
import { type Maybe } from "../lib/types";
import { cn } from "../lib/utils";

export interface RichTextProps extends ComponentProps<"article"> {
  jsonStringData: Maybe<string>;
}

export function RichText({
  jsonStringData,
  className,
  ...props
}: RichTextProps) {
  const data = parseEditorJSData(jsonStringData);
  const editorHtml = EditorJSHTML();

  if (!data) {
    return null;
  }

  return (
    <article
      className={cn("[&>*]:mt-0", className)}
      {...props}
      dangerouslySetInnerHTML={{
        __html: editorHtml.parse(data).join(""),
      }}
    />
  );
}
