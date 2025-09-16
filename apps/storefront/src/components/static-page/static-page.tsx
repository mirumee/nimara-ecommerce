import edjsHTML from "editorjs-html";
import React from "react";
import xss from "xss";

import type { Maybe } from "@/lib/types";

const parser = edjsHTML();

type EditorJSContent = {
  blocks?: Array<string>;
};

export const StaticPage = async ({ body }: { body: Maybe<string> }) => {
  let contentHtml: string[] | null = null;

  if (body) {
    try {
      const parsedContent = JSON.parse(body) as EditorJSContent;

      if (parsedContent && parsedContent.blocks) {
        contentHtml = parser.parse(parsedContent);
      }
    } catch (error) {
      contentHtml = [body];
    }
  }

  return (
    <div className="text-primary container pb-6">
      {contentHtml ? (
        <div className="prose prose-h1:my-6 prose-h1:text-primary prose-h1:text-center prose-h1:text-4xl prose-h2:text-primary prose-h2:text-center prose-h2:text-4xl prose-p:my-0 dark:prose-p:text-stone-200 min-w-full break-words">
          {contentHtml.map((content) => (
            <div
              key={content}
              dangerouslySetInnerHTML={{ __html: xss(content) }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
