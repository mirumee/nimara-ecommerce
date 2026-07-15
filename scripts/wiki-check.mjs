#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const wikiRoot = path.join(repoRoot, "llm-wiki");
const errors = [];
const warnings = [];

const toPosix = (value) => value.split(path.sep).join("/");
const relativeToWiki = (file) => toPosix(path.relative(wikiRoot, file));

const collectMarkdown = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectMarkdown(fullPath);
    }

    return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
  });

const frontmatterOf = (content) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  return match?.[1] ?? null;
};

const scalar = (frontmatter, key) => {
  const match = frontmatter.match(
    new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, "m"),
  );

  return match?.[1]?.trim() ?? null;
};

const list = (frontmatter, key) => {
  const lines = frontmatter.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `${key}:`);

  if (start === -1) {
    return [];
  }

  const values = [];

  for (const line of lines.slice(start + 1)) {
    const match = line.match(/^\s+-\s+["']?(.+?)["']?\s*$/);

    if (!match) {
      break;
    }

    values.push(match[1]);
  }

  return values;
};

const git = (args) =>
  spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
  });

const markdownFiles = collectMarkdown(wikiRoot);
const markdownSet = new Set(markdownFiles.map((file) => path.resolve(file)));
const conceptFiles = markdownFiles.filter(
  (file) => !["index.md", "log.md"].includes(path.basename(file)),
);
const externalTrackerName = ["ji", "ra"].join("");
const externalWorkItemPrefix = ["M", "S"].join("");
const forbiddenOperationalReferences = [
  new RegExp(`\\b${externalTrackerName}\\b`, "i"),
  new RegExp(`\\b${externalTrackerName}_[a-z_]+\\b`, "i"),
  new RegExp(`\\b${externalWorkItemPrefix}-\\d+\\b`, "i"),
];

for (const file of markdownFiles) {
  const content = readFileSync(file, "utf8");

  if (forbiddenOperationalReferences.some((pattern) => pattern.test(content))) {
    errors.push(
      `${relativeToWiki(file)}: contains a forbidden operational-tracker reference`,
    );
  }
}

for (const file of conceptFiles) {
  const relativeFile = relativeToWiki(file);
  const content = readFileSync(file, "utf8");
  const frontmatter = frontmatterOf(content);

  if (!frontmatter) {
    errors.push(`${relativeFile}: missing or malformed YAML frontmatter`);
    continue;
  }

  if (!scalar(frontmatter, "type")) {
    errors.push(`${relativeFile}: frontmatter requires a non-empty type`);
  }

  const knowledgeStatus = scalar(frontmatter, "knowledge_status");
  const directionStatus = scalar(frontmatter, "direction_status");

  if (
    knowledgeStatus &&
    ![
      "current",
      "planned",
      "mixed",
      "research",
      "reference",
      "historical",
    ].includes(knowledgeStatus)
  ) {
    errors.push(
      `${relativeFile}: unsupported knowledge_status ${knowledgeStatus}`,
    );
  }

  if (knowledgeStatus === "research" && !scalar(frontmatter, "source_status")) {
    errors.push(`${relativeFile}: research concept requires source_status`);
  }

  if (
    directionStatus &&
    ![
      "planned",
      "active",
      "done",
      "abandoned",
      "untracked",
      "unknown",
    ].includes(directionStatus)
  ) {
    errors.push(
      `${relativeFile}: unsupported direction_status ${directionStatus}`,
    );
  }

  if (
    knowledgeStatus === "planned" &&
    !scalar(frontmatter, "direction_status")
  ) {
    errors.push(`${relativeFile}: planned concept requires direction_status`);
  }

  if (["current", "mixed"].includes(knowledgeStatus)) {
    for (const field of [
      "implementation_status",
      "direction_status",
      "verified_at",
      "code_branch",
      "code_commit",
    ]) {
      if (!scalar(frontmatter, field)) {
        errors.push(
          `${relativeFile}: ${knowledgeStatus} concept requires ${field}`,
        );
      }
    }

    const branch = scalar(frontmatter, "code_branch");
    const commit = scalar(frontmatter, "code_commit");
    const scopePaths = list(frontmatter, "scope_paths");

    if (branch && branch !== "main") {
      errors.push(`${relativeFile}: code_branch must be main, found ${branch}`);
    }

    if (commit && !/^[0-9a-f]{40}$/.test(commit)) {
      errors.push(
        `${relativeFile}: code_commit must be a full 40-character SHA`,
      );
    }

    if (!scopePaths.length) {
      errors.push(
        `${relativeFile}: ${knowledgeStatus} concept requires scope_paths`,
      );
    }

    if (commit && /^[0-9a-f]{40}$/.test(commit)) {
      const commitCheck = git(["cat-file", "-e", `${commit}^{commit}`]);

      if (commitCheck.status !== 0) {
        errors.push(
          `${relativeFile}: code_commit ${commit} is not available locally`,
        );
      } else {
        for (const scopePath of scopePaths) {
          const normalized = scopePath.replace(/^\.\//, "").replace(/\/$/, "");
          const pathCheck = git(["cat-file", "-e", `${commit}:${normalized}`]);

          if (pathCheck.status !== 0) {
            errors.push(
              `${relativeFile}: scope_path ${scopePath} does not exist at ${commit.slice(0, 12)}`,
            );
          }
        }
      }
    }
  }
}

const localLinkPattern = /(?<!!)\[[^\]]*\]\(([^)]+)\)/g;
const indexedConcepts = new Set();
const rootIndex = path.join(wikiRoot, "index.md");

for (const file of markdownFiles) {
  const relativeFile = relativeToWiki(file);
  const content = readFileSync(file, "utf8");
  const linkableContent = content.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, "");
  const isTemplate = relativeFile.startsWith("_templates/");

  for (const match of linkableContent.matchAll(localLinkPattern)) {
    let target = match[1].trim();

    if (target.startsWith("<") && target.endsWith(">")) {
      target = target.slice(1, -1);
    }

    if (
      !target ||
      target.startsWith("#") ||
      /^[a-z][a-z0-9+.-]*:/i.test(target)
    ) {
      continue;
    }

    const pathOnly = target.split("#")[0].split("?")[0];

    if (!pathOnly) {
      continue;
    }

    let decoded;

    try {
      decoded = decodeURIComponent(pathOnly);
    } catch {
      errors.push(`${relativeFile}: invalid URL encoding in ${target}`);
      continue;
    }

    if (decoded.startsWith("/")) {
      errors.push(
        `${relativeFile}: use a document-relative link instead of ${target}`,
      );
      continue;
    }

    const resolved = path.resolve(path.dirname(file), decoded);

    if (
      !resolved.startsWith(`${wikiRoot}${path.sep}`) &&
      resolved !== wikiRoot
    ) {
      errors.push(`${relativeFile}: link escapes the wiki bundle: ${target}`);
      continue;
    }

    if (!existsSync(resolved) && !isTemplate) {
      const formerBundleRelative = path.resolve(wikiRoot, decoded);
      const hint = existsSync(formerBundleRelative)
        ? " (looks like the former implicit bundle-root format)"
        : "";
      errors.push(`${relativeFile}: dangling link ${target}${hint}`);
      continue;
    }

    if (file === rootIndex && markdownSet.has(resolved)) {
      indexedConcepts.add(resolved);
    }
  }
}

for (const file of conceptFiles) {
  if (!indexedConcepts.has(path.resolve(file))) {
    errors.push(`${relativeToWiki(file)}: missing from root index.md`);
  }
}

if (existsSync(path.join(wikiRoot, "delivery"))) {
  errors.push(
    "llm-wiki/delivery is not part of the encyclopedia model; map direction into durable concepts",
  );
}

const mainRef = ["main", "refs/remotes/origin/main"]
  .map((reference) => git(["rev-parse", "--verify", reference]))
  .find((result) => result.status === 0);

if (mainRef) {
  const mainCommit = mainRef.stdout.trim();
  const stale = conceptFiles.filter((file) => {
    const frontmatter = frontmatterOf(readFileSync(file, "utf8"));

    return (
      frontmatter &&
      ["current", "mixed"].includes(scalar(frontmatter, "knowledge_status")) &&
      scalar(frontmatter, "code_commit") !== mainCommit
    );
  });

  if (stale.length) {
    errors.push(
      `current-state concepts are stale against local main ${mainCommit.slice(0, 12)}:\n` +
        stale.map((file) => `  - ${relativeToWiki(file)}`).join("\n"),
    );
  }
} else {
  warnings.push(
    "local main ref is unavailable; code freshness comparison was skipped",
  );
}

for (const warning of warnings) {
  console.warn(`WARN ${warning}`);
}

if (errors.length) {
  console.error(`Nimara Wiki check failed with ${errors.length} issue(s):`);

  for (const [index, error] of errors.entries()) {
    console.error(`${index + 1}. ${error}`);
  }

  process.exit(1);
}

console.log(
  `Nimara Wiki check passed: ${markdownFiles.length} Markdown files, ` +
    `${conceptFiles.length} concepts, ${indexedConcepts.size} indexed concepts.`,
);
