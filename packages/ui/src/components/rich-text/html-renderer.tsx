import { cn } from "../../lib/utils";
import { type RichTextRendererProps } from "./types";

export const HTMLRenderer = ({
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
        "dark:[&_blockquote]:text-foreground dark:[&_h1]:text-foreground dark:[&_h2]:text-foreground dark:[&_h3]:text-foreground dark:[&_li]:text-foreground dark:[&_ol>li]:marker:text-foreground dark:[&_p]:text-foreground dark:[&_ul>li]:marker:text-foreground",
        className,
      )}
      {...props}
      dangerouslySetInnerHTML={{ __html: contentData }}
    />
  );
};
