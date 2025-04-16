import { type ComponentProps } from "react";

import { type Maybe } from "../../lib/types";
import { EditorjsRenderer } from "./editorjs-renderer";
import { HTMLRenderer } from "./html-renderer";
import { MarkdownRenderer } from "./markdown-renderer";
export interface RichTextProps extends ComponentProps<"article"> {
  contentData: Maybe<string>;
  contentType?: "editorjs" | "markdown" | "html";
  disableProse?: boolean;
}

export const RichText = ({
  contentData,
  contentType = "editorjs",
  ...props
}: RichTextProps) => {
  if (!contentData) {
    return null;
  }

  const rendererProps = { contentData, ...props };

  switch (contentType) {
    case "editorjs":
      return <EditorjsRenderer {...rendererProps} />;
    case "markdown":
      return <MarkdownRenderer {...rendererProps} />;
    case "html":
      return <HTMLRenderer {...rendererProps} />;
    default:
      return null;
  }
};
