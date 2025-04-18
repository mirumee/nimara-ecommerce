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
        "max-w-none [&>*]:mt-0",
        className,
      )}
      {...props}
      dangerouslySetInnerHTML={{ __html: contentData }}
    />
  );
};
