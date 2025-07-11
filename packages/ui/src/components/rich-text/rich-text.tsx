import { type ComponentProps, lazy, type ReactNode, Suspense } from "react";

import { type Maybe } from "../../lib/types";

const RENDERERS = {
  editorjs: lazy(() =>
    import("./editorjs-renderer").then((module) => ({
      default: module.EditorjsRenderer,
    })),
  ),
  markdown: lazy(() =>
    import("./markdown-renderer").then((module) => ({
      default: module.MarkdownRenderer,
    })),
  ),
  html: lazy(() =>
    import("./html-renderer").then((module) => ({
      default: module.HTMLRenderer,
    })),
  ),
};

export interface RichTextProps extends ComponentProps<"article"> {
  contentData: Maybe<string>;
  contentType?: "editorjs" | "markdown" | "html";
  disableProse?: boolean;
  /** A fallback UI to show while the component is loading */
  suspenseFallback?: ReactNode;
}

export const RichText = ({
  contentData,
  contentType = "editorjs",
  suspenseFallback = null, // Provide a default fallback
  ...props
}: RichTextProps) => {
  if (!contentData) {
    return null;
  }

  const Renderer = RENDERERS[contentType];

  if (!Renderer) {
    return null;
  }

  const rendererProps = { contentData, ...props };

  return (
    <Suspense fallback={suspenseFallback}>
      <Renderer {...rendererProps} />
    </Suspense>
  );
};
