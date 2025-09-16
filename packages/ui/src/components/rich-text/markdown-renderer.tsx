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
        "dark:[&_blockquote]:text-stone-200 dark:[&_h1]:text-stone-200 dark:[&_h2]:text-stone-200 dark:[&_h3]:text-stone-200 dark:[&_li]:text-stone-200 dark:[&_ol>li]:marker:text-stone-200 dark:[&_p]:text-stone-200 dark:[&_ul>li]:marker:text-stone-200",
        className,
      )}
      {...props}
    >
      <ReactMarkdown>{contentData}</ReactMarkdown>
    </article>
  );
};
