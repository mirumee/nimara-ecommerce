import EditorJSHTML from "editorjs-html";
import { stripHtml } from "string-strip-html";

import { type Maybe } from "./types";

interface EditorJsResponse {
  blocks: readonly any[];
  time: string;
  version: string;
}

export const parseEditorJSData = (
  jsonStringData: Maybe<string>,
): EditorJsResponse | null => {
  if (!jsonStringData) {
    return null;
  }

  let data: EditorJsResponse;

  try {
    data = JSON.parse(jsonStringData) as EditorJsResponse;
  } catch (e) {
    console.error(e);

    return null;
  }

  if (!data.blocks?.length) {
    // No data to render
    return null;
  }

  // Path for compatibility with data from older version od EditorJS
  if (!data.time) {
    data.time = Date.now().toString();
  }

  if (!data.version) {
    data.version = "2.22.2";
  }

  return data;
};

export const editorJSDataToString = (jsonStringData: Maybe<string>) => {
  let editorText = "";

  const data = parseEditorJSData(jsonStringData);

  if (data) {
    const htmlData: string = EditorJSHTML().parse(data).join(". ");

    if (htmlData) {
      editorText = stripHtml(htmlData).result;
    }
  }

  return editorText;
};
