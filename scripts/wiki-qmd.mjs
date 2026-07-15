#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const wikiDir = path.join(repoRoot, "llm-wiki");
const collectionName = "nimara-wiki";
const branchResult = spawnSync("git", ["branch", "--show-current"], {
  cwd: repoRoot,
  encoding: "utf8",
});
const branchName = (branchResult.stdout || "").trim() || "detached";
const branchSlug = branchName.replace(/[^a-zA-Z0-9._-]+/g, "-");
const worktreeSlug = createHash("sha256")
  .update(repoRoot)
  .digest("hex")
  .slice(0, 8);
const indexName =
  process.env.QMD_INDEX || `nimara-wiki-${branchSlug}-${worktreeSlug}`;
const context =
  "Nimara encyclopedia: current system, applications, capabilities, architecture, integrations, product direction, QA, ADRs, PRDs, and source manifests. Current implementation is verified against main at a recorded commit. Start with llm-wiki/system/Nimara.md and use llm-wiki/AGENTS.md for the evidence model.";

const command = process.argv[2] || "help";
const rest = process.argv.slice(3).filter((arg) => arg !== "--");

const usage = `Usage:
  pnpm wiki:qmd:setup              Configure the local qmd collection and context
  pnpm wiki:qmd:update             Re-index markdown files
  pnpm wiki:qmd:embed              Refresh vector embeddings
  pnpm wiki:qmd:rebuild            Run update, then embed
  pnpm wiki:qmd:status             Show qmd status for this project index
  pnpm wiki:qmd:ls [path]          List indexed wiki files
  pnpm wiki:qmd:search "<query>"   BM25 search within the wiki
  pnpm wiki:qmd:query "<query>"    Hybrid search within the wiki
  pnpm wiki:qmd:get "<docid|uri>"  Retrieve a document from qmd
  pnpm wiki:qmd:mcp [args...]      Start qmd MCP against the project index

This wrapper uses qmd --index ${indexName}, isolated by branch and worktree, so
local data is stored outside git under ~/.cache/qmd/${indexName}.sqlite.
Override with QMD_INDEX when a shared local index is intentional. Install qmd first:

  npm install -g @tobilu/qmd
`;

function fail(message, status = 1) {
  console.error(message);
  process.exit(status);
}

function qmdArgs(args) {
  return ["--index", indexName, ...args];
}

function run(args, options = {}) {
  const result = spawnSync("qmd", qmdArgs(args), {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.error?.code === "ENOENT") {
    fail(`qmd is not installed or not on PATH.\n\n${usage}`);
  }

  if (result.error) {
    fail(result.error.message);
  }

  if (result.status !== 0) {
    if (options.capture && result.stderr) {
      console.error(result.stderr);
    }
    process.exit(result.status || 1);
  }

  return options.capture ? (result.stdout || "").trim() : "";
}

function hasCollection() {
  const output = run(["collection", "list"], { capture: true });

  return output.includes(`${collectionName} (qmd://${collectionName}/)`);
}

function hasContext() {
  const output = run(["context", "list"], { capture: true });

  return output.includes(context);
}

function requireArgs(args, example) {
  if (!args.length) {
    fail(`Missing argument.\n\nExample:\n  ${example}`);
  }
}

function setup() {
  if (!existsSync(wikiDir)) {
    fail(`Wiki directory not found: ${wikiDir}`);
  }

  if (hasCollection()) {
    console.log(`qmd collection already configured: ${collectionName}`);
  } else {
    run([
      "collection",
      "add",
      wikiDir,
      "--name",
      collectionName,
      "--mask",
      "**/*.md",
    ]);
  }

  if (hasContext()) {
    console.log(`qmd context already configured for: ${collectionName}`);
  } else {
    run(["context", "add", `qmd://${collectionName}/`, context]);
  }

  run(["status"]);
  console.log(
    "\nNext: run `pnpm wiki:qmd:embed` to generate vector embeddings.",
  );
}

function withCollection(args) {
  return [...args, "-c", collectionName];
}

switch (command) {
  case "help":
  case "--help":
  case "-h":
    console.log(usage);
    break;
  case "setup":
    setup();
    break;
  case "update":
    run(["update"]);
    break;
  case "embed":
    run(["embed", "-c", collectionName, ...rest]);
    break;
  case "rebuild":
    run(["update"]);
    run(["embed", "-c", collectionName, ...rest]);
    break;
  case "status":
    run(["status"]);
    break;
  case "ls":
    run(["ls", rest[0] || collectionName, ...rest.slice(1)]);
    break;
  case "search":
    requireArgs(rest, 'pnpm wiki:qmd:search "user reviews"');
    run(withCollection(["search", ...rest]));
    break;
  case "query":
    requireArgs(
      rest,
      'pnpm wiki:qmd:query "what contradicts the reviews PRD?"',
    );
    run(withCollection(["query", ...rest]));
    break;
  case "get":
    requireArgs(rest, 'pnpm wiki:qmd:get "#abc123" --full');
    run(["get", ...rest]);
    break;
  case "mcp":
    run(["mcp", ...rest]);
    break;
  default:
    fail(`Unknown command: ${command}\n\n${usage}`);
}
