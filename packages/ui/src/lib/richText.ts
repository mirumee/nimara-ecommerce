import EditorJSHTML from "editorjs-html";
import { stripHtml } from "string-strip-html";

import { type Maybe } from "./types";

/** Version string stored with Editor.js payloads for Saleor compatibility. */
export const EDITOR_JS_VERSION = "2.31.5";

/**
 * Serializable Editor.js document (no `@editorjs/editorjs` dependency in `@nimara/ui`).
 * Compatible with `editorjs-html` and typical Saleor payloads.
 */
export type EditorJsOutputBlock = {
  data: Record<string, unknown>;
  id?: string;
  type: string;
};

export type EditorJsOutputData = {
  blocks: EditorJsOutputBlock[];
  time?: number;
  version?: string;
};

type EditorJsListItem =
  | string
  | {
      content?: unknown;
      items?: unknown;
    };

type EditorJsListBlockData = {
  items?: unknown;
  style?: string;
};

/**
 * Parse a JSON string into Editor.js output. Unlike {@link parseEditorJSData},
 * allows an empty `blocks` array (for editing).
 */
export function parseEditorJsOutputData(
  jsonStringData: Maybe<string>,
): EditorJsOutputData | null {
  if (!jsonStringData?.trim()) {
    return null;
  }

  try {
    const data = JSON.parse(jsonStringData) as {
      blocks?: EditorJsOutputBlock[];
      time?: number;
      version?: string;
    };

    if (!data || typeof data !== "object" || !Array.isArray(data.blocks)) {
      return null;
    }

    return {
      time: typeof data.time === "number" ? data.time : Date.now(),
      blocks: data.blocks,
      version: data.version ?? EDITOR_JS_VERSION,
    };
  } catch {
    return null;
  }
}

function renderEditorJsListItems(
  items: EditorJsListItem[],
  tag: "ul" | "ol",
): string {
  const html = items
    .map((item) => {
      if (typeof item === "string") {
        return `<li>${item}</li>`;
      }

      if (!item || typeof item !== "object") {
        return "";
      }

      const content =
        typeof item.content === "string"
          ? item.content
          : String(item.content ?? "");
      const nestedItems = Array.isArray(item.items)
        ? renderEditorJsListItems(item.items as EditorJsListItem[], tag)
        : "";

      return `<li>${content}${nestedItems}</li>`;
    })
    .join("");

  return `<${tag}>${html}</${tag}>`;
}

function parseEditorJsListBlock(block: {
  data?: EditorJsListBlockData;
}): string {
  const data = block.data;

  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    return "";
  }

  // Checklist can be represented as list items with metadata in newer list tool versions.
  // Render it as <ul> for compatibility in both storefront and text extraction.
  const tag = data.style === "ordered" ? "ol" : "ul";

  return renderEditorJsListItems(data.items as EditorJsListItem[], tag);
}

export function createEditorJsHtmlParser() {
  return EditorJSHTML({
    list: parseEditorJsListBlock as never,
    nestedList: parseEditorJsListBlock as never,
  });
}

export function emptyEditorJsJsonString(): string {
  return JSON.stringify({
    time: Date.now(),
    blocks: [],
    version: EDITOR_JS_VERSION,
  });
}

export function emptyEditorJsOutputData(): EditorJsOutputData {
  return {
    time: Date.now(),
    blocks: [],
    version: EDITOR_JS_VERSION,
  };
}

/**
 * Convert plain text (paragraphs separated by blank lines) to Editor.js JSON.
 */
export function plainTextToEditorJsJsonString(plainText: string): string {
  const blocks = plainText
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({ type: "paragraph" as const, data: { text } }));

  return JSON.stringify({
    time: Date.now(),
    blocks,
    version: EDITOR_JS_VERSION,
  });
}

function htmlToEditorJsOutputData(html: string): EditorJsOutputData {
  if (typeof window === "undefined") {
    return emptyEditorJsOutputData();
  }

  const doc = new DOMParser().parseFromString(
    `<div id="__nimara-rt-root">${html}</div>`,
    "text/html",
  );
  const root = doc.getElementById("__nimara-rt-root");

  if (!root) {
    return {
      time: Date.now(),
      blocks: html.trim()
        ? [{ type: "paragraph", data: { text: html.trim() } }]
        : [],
      version: EDITOR_JS_VERSION,
    };
  }

  const blocks: EditorJsOutputBlock[] = [];
  const children = Array.from(root.children);

  if (children.length === 0) {
    const inner = root.innerHTML.trim();

    if (inner) {
      blocks.push({ type: "paragraph", data: { text: inner } });
    }
  } else {
    for (const child of children) {
      const tag = child.tagName.toLowerCase();

      if (tag === "p") {
        blocks.push({
          type: "paragraph",
          data: { text: child.innerHTML.trim() || "<br>" },
        });
      } else if (/^h[1-6]$/.test(tag)) {
        const level = Math.min(Math.max(Number.parseInt(tag[1], 10), 1), 6) as
          | 1
          | 2
          | 3
          | 4
          | 5
          | 6;

        blocks.push({
          type: "header",
          data: {
            text: child.textContent?.trim() ?? "",
            level,
          },
        });
      } else {
        blocks.push({
          type: "paragraph",
          data: { text: child.innerHTML.trim() },
        });
      }
    }
  }

  if (blocks.length === 0 && html.trim()) {
    blocks.push({ type: "paragraph", data: { text: html.trim() } });
  }

  return {
    time: Date.now(),
    blocks,
    version: EDITOR_JS_VERSION,
  };
}

/**
 * Normalize Saleor / dashboard content to a compact Editor.js JSON string for forms.
 * Handles Editor.js JSON, HTML descriptions, and plain text.
 */
export function normalizeToEditorJs(raw: string | null | undefined): string {
  if (!raw?.trim()) {
    return emptyEditorJsJsonString();
  }

  const s = raw.trim();
  const asOutput = parseEditorJsOutputData(s);

  if (asOutput) {
    return JSON.stringify(asOutput);
  }

  if (s.startsWith("<")) {
    return JSON.stringify(htmlToEditorJsOutputData(s));
  }

  return plainTextToEditorJsJsonString(s);
}

/**
 * Ensure a value sent to Saleor `richText` / product `description` is valid Editor.js JSON.
 */
export function toEditorJsPayloadJson(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return emptyEditorJsJsonString();
  }

  let parsed: { blocks?: unknown } | null = null;

  try {
    parsed = JSON.parse(trimmed) as { blocks?: unknown };
  } catch (error) {
    // Not valid JSON input; fall back to plain-text -> Editor.js conversion below.
    console.debug("[richText] Input is not valid JSON", error);
  }

  if (parsed && typeof parsed === "object" && Array.isArray(parsed.blocks)) {
    return JSON.stringify(parsed);
  }

  return plainTextToEditorJsJsonString(trimmed);
}

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

  // Path for compatibility with data from older version of EditorJS
  if (!data.time) {
    data.time = Date.now().toString();
  }

  if (!data.version) {
    data.version = EDITOR_JS_VERSION;
  }

  return data;
};

export const editorJSDataToString = (jsonStringData: Maybe<string>) => {
  let editorText = "";

  const data = parseEditorJSData(jsonStringData);

  if (data) {
    const htmlData: string = createEditorJsHtmlParser()
      // editorjs-html typings expect Editor.js output; our shape matches at runtime
      .parse(data as never)
      .join(". ");

    if (htmlData) {
      editorText = stripHtml(htmlData).result;
    }
  }

  return editorText;
};

/** True when Editor.js JSON has no meaningful text (e.g. optional `description` on create). */
export function isEditorJsPayloadEffectivelyEmpty(
  jsonStringData: Maybe<string>,
): boolean {
  return editorJSDataToString(jsonStringData).trim().length === 0;
}
