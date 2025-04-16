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
        "max-w-none [&>*]:mt-0",
        className,
      )}
      {...props}
    >
      <ReactMarkdown>{contentData}</ReactMarkdown>
    </article>
  );
};
