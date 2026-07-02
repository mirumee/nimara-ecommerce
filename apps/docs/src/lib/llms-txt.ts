import fs from "node:fs";
import path from "node:path";

export const ROOT_DOCS_DIR = "../../docs";
const DOC_FILE_EXTENSIONS = new Set([".md", ".mdx"]);

export type DocFile = { content: string; relPath: string };

const parseFrontmatter = (content: string) => {
  const match = content.match(/^---\n([\s\S]*?)\n---/);

  if (!match) return {};

  const title = match[1].match(/^title:\s*(.+)$/m)?.[1]?.trim();
  const description = match[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();

  return { description, title };
};

const getDocFiles = async (dir: string): Promise<string[]> => {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(async (entry) => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          return getDocFiles(fullPath);
        }

        return DOC_FILE_EXTENSIONS.has(path.extname(entry.name))
          ? [fullPath]
          : [];
      }),
  );

  return files.flat();
};

export const getDocsFiles = async (siteDir: string): Promise<DocFile[]> => {
  const docsDir = path.resolve(siteDir, ROOT_DOCS_DIR);
  const filePaths = await getDocFiles(docsDir);

  return Promise.all(
    filePaths.map(async (fp) => ({
      content: await fs.promises.readFile(fp, "utf8"),
      relPath: path.relative(docsDir, fp),
    })),
  );
};

export const buildDocsIndex = ({
  docs,
  siteTitle,
  siteUrl,
  tagline,
}: {
  docs: DocFile[];
  siteTitle: string;
  siteUrl: string;
  tagline?: string;
}): string => {
  const header = [
    `# ${siteTitle} Documentation`,
    ...(tagline ? ["", tagline] : []),
    "",
  ];

  const lines = docs.map(({ content, relPath }) => {
    const { description, title } = parseFrontmatter(content);
    const label = title ?? relPath;
    const url = `${siteUrl.replace(/\/$/, "")}/docs/${relPath}`;
    const line = `- [${label}](${url})`;

    return description ? `${line}: ${description}` : line;
  });

  return [...header, "## Docs", "", ...lines, ""].join("\n");
};
