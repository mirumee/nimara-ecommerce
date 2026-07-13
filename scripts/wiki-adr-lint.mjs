#!/usr/bin/env node

// Deterministic quality linter for wiki ADRs (MADR structure).
// Enforces the ADR quality bar in llm-wiki/AGENTS.md so a shallow, single-option
// ADR fails mechanically instead of relying on the author to self-check.
//
// Usage:
//   pnpm wiki:adr:lint                 Lint every ADR-*.md in llm-wiki/tech/ADR/
//   pnpm wiki:adr:lint <file.md>       Lint a single ADR file
// Exit code 1 if any ADR has an ERROR (warnings do not fail the run).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const adrDir = path.join(repoRoot, "llm-wiki", "tech", "ADR");
const mocPath = path.join(adrDir, "ADR MOC.md");

const REQUIRED_SECTIONS = [
  "Context and Problem Statement",
  "Decision Drivers",
  "Considered Options",
  "Decision Outcome",
  "Pros and Cons of the Options",
  "Implementation Notes",
  "Consequences",
];

/** Split a markdown body into a map of `## Heading` -> section text. */
function sectionsOf(body) {
  const map = new Map();
  const lines = body.split("\n");
  let current = null;
  let buf = [];
  const flush = () => {
    if (current !== null) map.set(current, buf.join("\n"));
  };
  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      flush();
      current = m[1];
      buf = [];
    } else {
      buf.push(line);
    }
  }
  flush();
  return map;
}

function countListItems(text) {
  if (!text) return 0;
  return text.split("\n").filter((l) => /^\s{0,3}(\d+\.|[-*])\s+\S/.test(l)).length;
}

function hasFrontmatter(raw) {
  return /^---\r?\n[\s\S]*?\r?\n---/.test(raw);
}

function lintAdr(file, raw, mocRegisterText) {
  const errors = [];
  const warnings = [];
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  const sections = sectionsOf(body);

  // Frontmatter + status
  if (!hasFrontmatter(raw)) errors.push("missing YAML frontmatter");
  else if (!/^status:/m.test(raw.split(/\r?\n---/)[0])) errors.push("frontmatter missing `status:`");

  // Required sections
  for (const s of REQUIRED_SECTIONS) {
    if (!sections.has(s)) errors.push(`missing section "## ${s}"`);
  }

  // Base system anchor
  const context = sections.get("Context and Problem Statement") || "";
  if (!/\*\*Base system:\*\*/.test(context)) {
    errors.push('Context is missing the "**Base system:**" line (the ADR gate)');
  }

  // >= 2 considered options
  const optionsText = sections.get("Considered Options") || "";
  const optionCount = countListItems(optionsText);
  if (optionCount < 2) {
    errors.push(`Considered Options lists ${optionCount} option(s); need >= 2 (a one-option ADR is not a decision)`);
  }

  // Rejection reasons: at least (options - 1), and at least 1
  const rejectCount = (body.match(/rejected because/gi) || []).length;
  const needReject = Math.max(1, optionCount - 1);
  if (rejectCount < needReject) {
    errors.push(`found ${rejectCount} "Rejected because" reason(s); need >= ${needReject} (every non-chosen option must say why it lost)`);
  }

  // Verdict present
  const outcome = sections.get("Decision Outcome") || "";
  if (!/chosen option|recommended/i.test(outcome)) {
    errors.push('Decision Outcome has no verdict (expected "Chosen option: …" or "Recommended: …")');
  }

  // Registered in ADR MOC
  const numMatch = path.basename(file).match(/^(ADR-\d+)/);
  if (numMatch && mocRegisterText && !mocRegisterText.includes(numMatch[1])) {
    errors.push(`not registered in ADR MOC (no "${numMatch[1]}" entry in the Register)`);
  }

  // --- Warnings: Implementation Notes concreteness ---
  const impl = sections.get("Implementation Notes") || "";
  if (!/```/.test(impl) && !/\binterface\b|\bDTO\b/i.test(impl)) {
    warnings.push("Implementation Notes has no interface/DTO sketch (code fence or `interface`/`DTO`)");
  }
  if (!/\b(packages|apps)\//.test(impl)) {
    warnings.push("Implementation Notes names no concrete monorepo path (packages/… or apps/…)");
  }
  if (!/[A-Z][A-Z0-9]{2,}_[A-Z0-9_]+/.test(impl) && !/\benv\b/i.test(impl)) {
    warnings.push("Implementation Notes gives no env schema (a NAMESPACED_VAR or the word env)");
  }

  // Warning: linked to something other than the ADR MOC (epic/solution)
  const related = sections.get("Related Notes") || "";
  const relLinks = (related.match(/\]\(([^)]+)\)/g) || []).filter((l) => !/ADR%20MOC|ADR MOC/.test(l));
  if (relLinks.length === 0) {
    warnings.push("Related Notes links only the ADR MOC (link the driving epic/solution too)");
  }

  return { errors, warnings };
}

function main() {
  const arg = process.argv[2];
  let files;
  if (arg) {
    const p = path.isAbsolute(arg) ? arg : path.join(repoRoot, arg);
    if (!existsSync(p)) {
      console.error(`✗ File not found: ${arg}`);
      process.exit(2);
    }
    files = [p];
  } else {
    if (!existsSync(adrDir)) {
      console.error(`✗ ADR directory not found: ${adrDir}`);
      process.exit(2);
    }
    files = readdirSync(adrDir)
      .filter((f) => /^ADR-.*\.md$/.test(f))
      .map((f) => path.join(adrDir, f));
  }

  if (files.length === 0) {
    console.log("No ADRs to lint (no ADR-*.md in llm-wiki/tech/ADR/).");
    process.exit(0);
  }

  let mocRegisterText = "";
  if (existsSync(mocPath)) {
    const moc = readFileSync(mocPath, "utf8");
    const reg = sectionsOf(moc.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")).get("Register");
    mocRegisterText = reg ?? moc;
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    const { errors, warnings } = lintAdr(file, raw, mocRegisterText);
    totalErrors += errors.length;
    totalWarnings += warnings.length;
    const name = path.basename(file);
    if (errors.length === 0 && warnings.length === 0) {
      console.log(`✓ ${name}`);
    } else {
      console.log(`${errors.length ? "✗" : "⚠"} ${name}`);
      for (const e of errors) console.log(`    ERROR   ${e}`);
      for (const w of warnings) console.log(`    warning ${w}`);
    }
  }

  console.log(
    `\n${files.length} ADR(s) checked — ${totalErrors} error(s), ${totalWarnings} warning(s).`,
  );
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
