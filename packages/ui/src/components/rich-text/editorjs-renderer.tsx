import EditorJSHTML from "editorjs-html";

import { parseEditorJSData } from "../../lib/richText";
import { cn } from "../../lib/utils";
import { type RichTextRendererProps } from "./types";

export function EditorjsRenderer({
  contentData,
  disableProse = false,
  className,
  ...props
}: RichTextRendererProps) {
  const data = parseEditorJSData(contentData);
  const editorHtml = EditorJSHTML();

  if (!data) {
    return null;
  }

  return (
    <article
      className={cn(
        { prose: !disableProse },
        "prose dark:prose-headings:text-stone-200 dark:tw-prose-body:text-stone-200 dark:prose-p:text-stone-200 dark:prose-li:text-stone-200 dark:prose-blockquote:text-stone-200 dark:prose-li:marker:text-stone-200 max-w-none [&>*]:mt-0",
        className,
      )}
      {...props}
      dangerouslySetInnerHTML={{
        __html: editorHtml.parse(data).join(""),
      }}
    />
  );
}
