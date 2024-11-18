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
    <div className="container">
      {contentHtml ? (
        <div className="prose min-w-full prose-h1:my-4 prose-h1:text-center prose-h1:text-4xl prose-h2:text-center prose-h2:text-4xl">
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
