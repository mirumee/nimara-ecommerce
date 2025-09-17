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
        "dark:[&_blockquote]:text-stone-200 dark:[&_h1]:text-stone-200 dark:[&_h2]:text-stone-200 dark:[&_h3]:text-stone-200 dark:[&_li]:text-stone-200 dark:[&_ol>li]:marker:text-stone-200 dark:[&_p]:text-stone-200 dark:[&_ul>li]:marker:text-stone-200",
        className,
      )}
      {...props}
      dangerouslySetInnerHTML={{
        __html: editorHtml.parse(data).join(""),
      }}
    />
  );
}
