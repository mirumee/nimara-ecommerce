import { extname } from "node:path";

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

export type AssetOptions = { basePath?: string; path?: string };

export const assetResponse = ({
  content,
  name,
}: {
  content: Uint8Array<ArrayBuffer>;
  name: string;
}) =>
  new Response(content, {
    headers: {
      "content-type":
        CONTENT_TYPES[extname(name)] ?? "application/octet-stream",
      // The file name carries no build hash, so a new deploy has to win.
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
