import edjsHTML from "editorjs-html";
import React from "react";
import xss from "xss";

import type { Maybe } from "@/lib/types";

const parser = edjsHTML();

export const StaticPage = async ({ body }: { body: Maybe<string> }) => {
  const contentHtml = body ? parser.parse(JSON.parse(body)) : null;

  return (
    <div className="container">
      {contentHtml ? (
        <div className="prose min-w-full prose-h1:my-4 prose-h1:text-center prose-h1:text-4xl">
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
