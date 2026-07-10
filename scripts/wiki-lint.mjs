#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DAY_MS = 24 * 60 * 60 * 1000;
const RESERVED_FILENAMES = new Set(["index.md", "log.md"]);
const RELATION_EXEMPT_TYPES = new Set([
  "Bibliography",
  "Source Material",
  "Template",
]);
const STALENESS_EXEMPT_TYPES = new Set([
  "Bibliography",
  "Source Material",
  "Template",
]);
const STALENESS_EXEMPT_STATUSES = new Set(["archived", "superseded"]);
const MOC_TYPES = new Set(["Map of Content", "Strategic Initiative Index"]);
const MOC_COVERAGE_EXEMPT_TYPES = new Set([
  "Agent Instructions",
  "Bibliography",
  "Map of Content",
  "Source Material",
  "Template",
]);

function parseArgs(argv) {
  const args = {
    allowSourceMigration: false,
    baseRef: process.env.WIKI_LINT_BASE ?? null,
    maxAgeDays: 120,
    now: new Date(),
    repoRoot: resolve(dirname(fileURLToPath(import.meta.url)), ".."),
    wikiRoot: "llm-wiki",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    const next = argv[index + 1];

    if (value === "--repo-root" && next) {
      args.repoRoot = resolve(next);
      index += 1;
    } else if (value === "--wiki-root" && next) {
      args.wikiRoot = next;
      index += 1;
    } else if (value === "--now" && next) {
      args.now = new Date(next);
      index += 1;
    } else if (value === "--max-age-days" && next) {
      args.maxAgeDays = Number(next);
      index += 1;
    } else if (value === "--base-ref" && next) {
      args.baseRef = next;
      index += 1;
    } else if (value === "--allow-source-migration") {
      args.allowSourceMigration = true;
    } else if (value === "--help") {
      console.log(`Usage: node scripts/wiki-lint.mjs [options]

Options:
  --repo-root <path>       Repository root (default: inferred)
  --wiki-root <path>       Wiki directory relative to repo root (default: llm-wiki)
  --now <ISO datetime>     Reference time for freshness checks
  --max-age-days <number>  Maximum age before a concept is stale (default: 120)
  --base-ref <git-ref>     Additional immutable-source baseline (or WIKI_LINT_BASE)
  --allow-source-migration Permit an intentional source body/hash migration
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${value}`);
    }
  }

  if (Number.isNaN(args.now.getTime())) {
    throw new Error("--now must be a valid ISO datetime");
  }

  if (!Number.isFinite(args.maxAgeDays) || args.maxAgeDays < 1) {
    throw new Error("--max-age-days must be a positive number");
  }

  args.wikiRoot = isAbsolute(args.wikiRoot)
    ? resolve(args.wikiRoot)
    : resolve(args.repoRoot, args.wikiRoot);

  return args;
}

async function listMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(path);
    }
  }

  return files.sort();
}

function unquote(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseFrontmatter(content) {
  if (!content.startsWith("---\n") && !content.startsWith("---\r\n")) {
    return {
      body: content,
      error: "missing opening frontmatter delimiter",
      meta: {},
    };
  }

  const lines = content.split(/\r?\n/);
  const closingIndex = lines.findIndex(
    (line, index) => index > 0 && line === "---",
  );

  if (closingIndex === -1) {
    return {
      body: content,
      error: "missing closing frontmatter delimiter",
      meta: {},
    };
  }

  const meta = {};
  let activeList = null;

  for (const line of lines.slice(1, closingIndex)) {
    const listItem = line.match(/^\s+-\s+(.+)$/);

    if (listItem && activeList) {
      meta[activeList].push(unquote(listItem[1]));
      continue;
    }

    const field = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):(?:\s*(.*))?$/);

    if (!field) {
      if (line.trim() && !line.trim().startsWith("#")) {
        return {
          body: lines.slice(closingIndex + 1).join("\n"),
          error: `unsupported frontmatter syntax: ${line.trim()}`,
          meta,
        };
      }

      continue;
    }

    const [, key, rawValue = ""] = field;

    if (!rawValue.trim()) {
      meta[key] = [];
      activeList = key;
      continue;
    }

    const inlineList = rawValue.trim().match(/^\[(.*)\]$/);

    if (inlineList) {
      meta[key] = inlineList[1]
        .split(",")
        .map((item) => unquote(item))
        .filter(Boolean);
      activeList = null;
      continue;
    }

    meta[key] = unquote(rawValue);
    activeList = null;
  }

  return {
    body: lines.slice(closingIndex + 1).join("\n"),
    error: null,
    meta,
  };
}

function withoutFencedCode(content) {
  return content.replace(/```[\s\S]*?```/g, "");
}

function extractMarkdownTargets(content) {
  const targets = [];
  const markdown = withoutFencedCode(content);
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;

  for (const match of markdown.matchAll(linkPattern)) {
    const target = match[1].trim().replace(/^<|>$/g, "");

    if (target) {
      targets.push(target);
    }
  }

  return targets;
}

function normalizeWikiTarget(target) {
  if (
    target.startsWith("#") ||
    /^(?:https?:|mailto:|tel:|data:)/i.test(target)
  ) {
    return null;
  }

  const withoutFragment = target.split("#", 1)[0].split("?", 1)[0];

  if (!withoutFragment.toLowerCase().endsWith(".md")) {
    return null;
  }

  try {
    return decodeURIComponent(withoutFragment).replace(/^\/+/, "");
  } catch {
    return withoutFragment.replace(/^\/+/, "");
  }
}

function relationSectionTargets(body) {
  const lines = body.split(/\r?\n/);
  const headingIndex = lines.findIndex((line) =>
    /^(#{1,6})\s+Related Notes\s*$/i.test(line.trim()),
  );

  if (headingIndex === -1) {
    return [];
  }

  const headingLevel = lines[headingIndex].trim().match(/^#+/)?.[0].length ?? 6;
  let endIndex = lines.length;

  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const nextHeading = lines[index].trim().match(/^(#{1,6})\s+/);

    if (nextHeading && nextHeading[1].length <= headingLevel) {
      endIndex = index;
      break;
    }
  }

  return extractMarkdownTargets(
    lines.slice(headingIndex + 1, endIndex).join("\n"),
  )
    .map(normalizeWikiTarget)
    .filter(Boolean);
}

function relativeWikiPath(wikiRoot, path) {
  return relative(wikiRoot, path).split("\\").join("/");
}

function addFinding(findings, category, file, message) {
  findings.push({ category, file, message });
}

function validateSourceRefs({ findings, meta, path, repoRoot, wikiRoot }) {
  const status =
    typeof meta.status === "string" ? meta.status.toLowerCase() : "";
  const refs = Array.isArray(meta.source_refs) ? meta.source_refs : [];

  if (status === "verified" && refs.length === 0) {
    addFinding(
      findings,
      "SOURCE",
      path,
      'status "verified" requires at least one source_refs entry',
    );
    return;
  }

  for (const sourceRef of refs) {
    if (/^https?:\/\//i.test(sourceRef)) {
      continue;
    }

    if (sourceRef.startsWith("repo:")) {
      const target = sourceRef.slice("repo:".length).split("#", 1)[0];

      if (!target || !existsSync(resolve(repoRoot, target))) {
        addFinding(
          findings,
          "SOURCE",
          path,
          `repository source does not exist: ${sourceRef}`,
        );
      }
      continue;
    }

    if (sourceRef.startsWith("wiki:")) {
      const target = sourceRef.slice("wiki:".length).split("#", 1)[0];

      if (!target || !existsSync(resolve(wikiRoot, target))) {
        addFinding(
          findings,
          "SOURCE",
          path,
          `wiki source does not exist: ${sourceRef}`,
        );
      }
      continue;
    }

    addFinding(
      findings,
      "SOURCE",
      path,
      `unsupported source_refs entry: ${sourceRef}`,
    );
  }
}

function readSourceHashAtRef({ path, ref, repoRoot, wikiRoot }) {
  try {
    const repoPath = relative(repoRoot, resolve(wikiRoot, path))
      .split("\\")
      .join("/");
    const content = execFileSync("git", ["show", `${ref}:${repoPath}`], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const value = parseFrontmatter(content).meta.content_sha256;

    return typeof value === "string" && /^sha256:[a-f0-9]{64}$/i.test(value)
      ? value.toLowerCase()
      : null;
  } catch {
    return null;
  }
}

function validateArchivedSourceBody({
  allowSourceMigration,
  baseRef,
  body,
  findings,
  meta,
  path,
  repoRoot,
  wikiRoot,
}) {
  const declaredHash = meta.content_sha256;

  if (
    typeof declaredHash !== "string" ||
    !/^sha256:[a-f0-9]{64}$/i.test(declaredHash)
  ) {
    addFinding(
      findings,
      "SOURCE",
      path,
      "source material requires content_sha256 in sha256:<hex> format",
    );
    return;
  }

  const actualHash = `sha256:${createHash("sha256").update(body).digest("hex")}`;

  if (actualHash.toLowerCase() !== declaredHash.toLowerCase()) {
    addFinding(
      findings,
      "SOURCE",
      path,
      `body does not match content_sha256 (actual: ${actualHash})`,
    );
  }

  if (allowSourceMigration || !existsSync(resolve(repoRoot, ".git"))) {
    return;
  }

  const baselineRefs = [...new Set([baseRef, "HEAD", "HEAD^"].filter(Boolean))];
  const changedFromRef = baselineRefs.find((ref) => {
    const baselineHash = readSourceHashAtRef({
      path,
      ref,
      repoRoot,
      wikiRoot,
    });

    return baselineHash && baselineHash !== declaredHash.toLowerCase();
  });

  if (changedFromRef) {
    addFinding(
      findings,
      "SOURCE",
      path,
      `content_sha256 changed from immutable baseline ${changedFromRef}; use --allow-source-migration only for an approved correction`,
    );
  }
}

async function lintWiki(args) {
  if (!existsSync(args.wikiRoot)) {
    throw new Error(`Wiki root does not exist: ${args.wikiRoot}`);
  }

  const markdownFiles = await listMarkdownFiles(args.wikiRoot);
  const allWikiPaths = new Set(
    markdownFiles.map((path) => relativeWikiPath(args.wikiRoot, path)),
  );
  const conceptFiles = markdownFiles.filter(
    (path) => !RESERVED_FILENAMES.has(path.split(/[\\/]/).at(-1)),
  );
  const concepts = [];
  const findings = [];

  for (const file of conceptFiles) {
    const path = relativeWikiPath(args.wikiRoot, file);
    const content = await readFile(file, "utf8");
    const parsed = parseFrontmatter(content);

    if (parsed.error) {
      addFinding(findings, "FRONTMATTER", path, parsed.error);
    }

    if (typeof parsed.meta.type !== "string" || !parsed.meta.type.trim()) {
      addFinding(findings, "FRONTMATTER", path, "missing non-empty type field");
    }

    concepts.push({ ...parsed, content, file, path });
  }

  const rootIndexPath = resolve(args.wikiRoot, "index.md");
  const indexContent = existsSync(rootIndexPath)
    ? await readFile(rootIndexPath, "utf8")
    : "";
  const indexedTargets = new Set(
    extractMarkdownTargets(indexContent)
      .map(normalizeWikiTarget)
      .filter(Boolean),
  );

  if (!indexContent) {
    addFinding(
      findings,
      "INDEX_COVERAGE",
      "index.md",
      "root index.md is missing",
    );
  }

  for (const concept of concepts) {
    if (!indexedTargets.has(concept.path)) {
      addFinding(
        findings,
        "INDEX_COVERAGE",
        concept.path,
        "concept is missing from root index.md",
      );
    }
  }

  const inbound = new Map(concepts.map((concept) => [concept.path, 0]));
  const mocInbound = new Map(concepts.map((concept) => [concept.path, 0]));
  const logPath = resolve(args.wikiRoot, "log.md");
  const logContent = existsSync(logPath) ? await readFile(logPath, "utf8") : "";
  const linkSources = [
    { content: indexContent, path: "index.md" },
    { content: logContent, path: "log.md" },
    ...concepts.map(({ content, meta, path }) => ({ content, meta, path })),
  ];

  for (const source of linkSources) {
    for (const rawTarget of extractMarkdownTargets(source.content)) {
      const target = normalizeWikiTarget(rawTarget);

      if (!target) {
        continue;
      }

      if (!allWikiPaths.has(target)) {
        addFinding(
          findings,
          "BROKEN_LINK",
          source.path,
          `target does not exist: ${target}`,
        );
      } else if (inbound.has(target) && target !== source.path) {
        inbound.set(target, inbound.get(target) + 1);

        if (MOC_TYPES.has(source.meta?.type)) {
          mocInbound.set(target, mocInbound.get(target) + 1);
        }
      }
    }
  }

  for (const concept of concepts) {
    if ((inbound.get(concept.path) ?? 0) === 0) {
      addFinding(
        findings,
        "ORPHAN",
        concept.path,
        "concept has no inbound link from index.md or another concept",
      );
    }

    if (
      !MOC_COVERAGE_EXEMPT_TYPES.has(concept.meta.type) &&
      (mocInbound.get(concept.path) ?? 0) === 0
    ) {
      addFinding(
        findings,
        "MOC_COVERAGE",
        concept.path,
        "concept has no inbound link from a domain Map of Content",
      );
    }

    const relatedTargets = relationSectionTargets(concept.body);

    if (
      !RELATION_EXEMPT_TYPES.has(concept.meta.type) &&
      relatedTargets.length === 0
    ) {
      addFinding(
        findings,
        "RELATION",
        concept.path,
        "missing Related Notes section with an internal Markdown link",
      );
    }

    const requiredRelations = Array.isArray(concept.meta.required_relations)
      ? concept.meta.required_relations
      : [];

    for (const requiredRelation of requiredRelations) {
      const normalizedRequiredRelation = normalizeWikiTarget(requiredRelation);

      if (
        !normalizedRequiredRelation ||
        !relatedTargets.includes(normalizedRequiredRelation)
      ) {
        addFinding(
          findings,
          "RELATION",
          concept.path,
          `required relation is missing from Related Notes: ${requiredRelation}`,
        );
      }
    }

    validateSourceRefs({
      findings,
      meta: concept.meta,
      path: concept.path,
      repoRoot: args.repoRoot,
      wikiRoot: args.wikiRoot,
    });

    if (
      concept.meta.type === "Source Material" &&
      (typeof concept.meta.resource !== "string" ||
        !concept.meta.resource.trim()) &&
      !/^#{1,6}\s+Provenance\b/im.test(concept.body) &&
      !extractMarkdownTargets(concept.body).some((target) =>
        /^https?:\/\//i.test(target),
      )
    ) {
      addFinding(
        findings,
        "SOURCE",
        concept.path,
        "source material requires resource metadata, a Provenance heading, or an external citation",
      );
    }

    if (concept.meta.type === "Source Material") {
      validateArchivedSourceBody({
        allowSourceMigration: args.allowSourceMigration,
        baseRef: args.baseRef,
        body: concept.body,
        findings,
        meta: concept.meta,
        path: concept.path,
        repoRoot: args.repoRoot,
        wikiRoot: args.wikiRoot,
      });
    }

    const status =
      typeof concept.meta.status === "string"
        ? concept.meta.status.toLowerCase()
        : "";

    if (
      !STALENESS_EXEMPT_TYPES.has(concept.meta.type) &&
      !STALENESS_EXEMPT_STATUSES.has(status)
    ) {
      const freshnessValue = concept.meta.verified_at ?? concept.meta.timestamp;

      if (typeof freshnessValue !== "string" || !freshnessValue.trim()) {
        addFinding(
          findings,
          "STALE",
          concept.path,
          "missing verified_at or timestamp; freshness cannot be evaluated",
        );
      } else {
        const freshnessDate = new Date(freshnessValue);

        if (Number.isNaN(freshnessDate.getTime())) {
          addFinding(
            findings,
            "FRONTMATTER",
            concept.path,
            `invalid freshness timestamp: ${freshnessValue}`,
          );
        } else {
          const ageDays = Math.floor(
            (args.now.getTime() - freshnessDate.getTime()) / DAY_MS,
          );

          if (ageDays > args.maxAgeDays) {
            addFinding(
              findings,
              "STALE",
              concept.path,
              `last meaningful verification is ${ageDays} days old (limit: ${args.maxAgeDays})`,
            );
          }
        }
      }
    }
  }

  return { conceptCount: concepts.length, findings };
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = await lintWiki(args);

    if (result.findings.length === 0) {
      console.log(
        `Wiki lint passed: ${result.conceptCount} concept documents are conformant, indexed, connected, current and sourced.`,
      );
      return;
    }

    result.findings
      .sort((left, right) =>
        `${left.category}:${left.file}:${left.message}`.localeCompare(
          `${right.category}:${right.file}:${right.message}`,
        ),
      )
      .forEach((finding) => {
        console.error(
          `[${finding.category}] ${finding.file}: ${finding.message}`,
        );
      });

    console.error(
      `Wiki lint failed: ${result.findings.length} finding(s) across ${result.conceptCount} concept documents.`,
    );
    process.exitCode = 1;
  } catch (error) {
    console.error(
      `Wiki lint could not run: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 2;
  }
}

await main();
