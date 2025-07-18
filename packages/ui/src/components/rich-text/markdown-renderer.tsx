import ReactMarkdown from "react-markdown";

import { cn } from "../../lib/utils";
import { type RichTextRendererProps } from "./types";

export const MarkdownRenderer = ({
  contentData,
  className,
  disableProse = false,
  ...props
}: RichTextRendererProps) => {
  if (!contentData) {
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
    >
      <ReactMarkdown>{contentData}</ReactMarkdown>
    </article>
  );
};
