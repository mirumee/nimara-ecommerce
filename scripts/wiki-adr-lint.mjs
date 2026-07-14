#!/usr/bin/env node

// Deterministic quality linter for wiki ADRs (DERBY-style design ADRs).
// Enforces the ADR quality bar in llm-wiki/AGENTS.md so a shallow, single-option
// ADR fails mechanically instead of relying on the author to self-check.
//
// Two rulesets:
//   - DERBY  (default): Recommendation / Problem / Requirements / Proposed solution /
//     Cross-cutting considerations, with the Nimara guardrails (Base system line,
//     >= 1 weighed Alternative solution with a rejection reason, concrete Proposed solution).
//   - MADR-legacy: the older Context/Drivers/Options/Outcome/Pros-Cons/Implementation/
//     Consequences structure. Applied only to ADRs whose frontmatter opts in with
//     `adr_format: "MADR-legacy"` (or any value containing "MADR"), so pre-DERBY records
//     stay green without being silently unchecked.
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

// DERBY-style required top-level (##) sections.
const DERBY_SECTIONS = [
  "Recommendation",
  "Problem",
  "Requirements",
  "Proposed solution",
  "Cross-cutting considerations",
];

// MADR-legacy required sections (pre-DERBY records only).
const MADR_SECTIONS = [
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

/** Extract a `### Heading` sub-section body from a parent section's text. */
function subsectionOf(text, name) {
  if (!text) return "";
  const lines = text.split("\n");
  let capturing = false;
  const buf = [];
  for (const line of lines) {
    const m = line.match(/^###\s+(.+?)\s*$/);
    if (m) {
      if (capturing) break; // next ### ends the block
      if (m[1].trim().toLowerCase() === name.toLowerCase()) {
        capturing = true;
        continue;
      }
    }
    if (capturing) buf.push(line);
  }
  return buf.join("\n");
}

function countListItems(text) {
  if (!text) return 0;
  return text.split("\n").filter((l) => /^\s{0,3}(\d+\.|[-*])\s+\S/.test(l)).length;
}

/** Count top-level (indent 0) list items — used to count alternatives, not their bullets. */
function countTopLevelItems(text) {
  if (!text) return 0;
  return text.split("\n").filter((l) => /^(\d+\.|[-*])\s+\S/.test(l)).length;
}

function hasFrontmatter(raw) {
  return /^---\r?\n[\s\S]*?\r?\n---/.test(raw);
}

function isLegacyMadr(frontmatter) {
  return /^adr_format:\s*["']?[^"'\n]*MADR/im.test(frontmatter);
}

/** Content minus HTML comments and blank lines — used to detect "empty" sections. */
function meaningful(text) {
  return (text || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

function commonChecks(raw, frontmatter, body, sections, requiredSections) {
  const errors = [];
  if (!hasFrontmatter(raw)) errors.push("missing YAML frontmatter");
  else if (!/^status:/m.test(frontmatter)) errors.push("frontmatter missing `status:`");
  for (const s of requiredSections) {
    if (!sections.has(s)) errors.push(`missing section "## ${s}"`);
  }
  return errors;
}

function lintDerby(raw, frontmatter, body, sections) {
  const errors = commonChecks(raw, frontmatter, body, sections, DERBY_SECTIONS);
  const warnings = [];

  // Base system anchor lives in Problem.
  const problem = sections.get("Problem") || "";
  if (!/\*\*Base system:\*\*/.test(problem)) {
    errors.push('Problem is missing the "**Base system:**" line (the ADR gate)');
  }

  // Proposed solution must actually contain a design (the decision).
  const proposed = sections.get("Proposed solution") || "";
  if (meaningful(proposed).length < 40) {
    errors.push("Proposed solution is empty or a stub — it must state the chosen design");
  }

  // Alternatives weighed under Cross-cutting considerations.
  const crossCutting = sections.get("Cross-cutting considerations") || "";
  const alternatives = subsectionOf(crossCutting, "Alternative solutions");
  const altCount = countTopLevelItems(alternatives);
  if (altCount < 1) {
    errors.push(
      'Alternative solutions weighs 0 alternatives; need >= 1 real alternative besides the proposed design (a design that weighs none is not a decision)',
    );
  }
  const rejectCount = (body.match(/rejected because/gi) || []).length;
  const needReject = Math.max(1, altCount);
  if (rejectCount < needReject) {
    errors.push(
      `found ${rejectCount} "Rejected because" reason(s); need >= ${needReject} (every weighed alternative must say why it lost)`,
    );
  }

  // Registered in ADR MOC (checked by caller-provided register text below).
  // --- Concreteness warnings on Proposed solution ---
  if (!/```/.test(proposed) && !/\binterface\b|\bDTO\b/i.test(proposed)) {
    warnings.push("Proposed solution has no interface/DTO sketch (code fence or `interface`/`DTO`)");
  }
  if (!/\b(packages|apps)\//.test(proposed)) {
    warnings.push("Proposed solution names no concrete monorepo path (packages/… or apps/…)");
  }
  const proposedPlusDevops = proposed + "\n" + subsectionOf(crossCutting, "DevOps / Infrastructure");
  if (!/[A-Z][A-Z0-9]{2,}_[A-Z0-9_]+/.test(proposedPlusDevops) && !/\benv\b/i.test(proposedPlusDevops)) {
    warnings.push("No env schema given (a NAMESPACED_VAR or the word env in Proposed solution / DevOps)");
  }

  return { errors, warnings };
}

function lintMadr(raw, frontmatter, body, sections) {
  const errors = commonChecks(raw, frontmatter, body, sections, MADR_SECTIONS);
  const warnings = [];

  const context = sections.get("Context and Problem Statement") || "";
  if (!/\*\*Base system:\*\*/.test(context)) {
    errors.push('Context is missing the "**Base system:**" line (the ADR gate)');
  }

  const optionsText = sections.get("Considered Options") || "";
  const optionCount = countListItems(optionsText);
  if (optionCount < 2) {
    errors.push(`Considered Options lists ${optionCount} option(s); need >= 2 (a one-option ADR is not a decision)`);
  }

  const rejectCount = (body.match(/rejected because/gi) || []).length;
  const needReject = Math.max(1, optionCount - 1);
  if (rejectCount < needReject) {
    errors.push(`found ${rejectCount} "Rejected because" reason(s); need >= ${needReject} (every non-chosen option must say why it lost)`);
  }

  const outcome = sections.get("Decision Outcome") || "";
  if (!/chosen option|recommended/i.test(outcome)) {
    errors.push('Decision Outcome has no verdict (expected "Chosen option: …" or "Recommended: …")');
  }

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

  return { errors, warnings };
}

function lintAdr(file, raw, mocRegisterText) {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const frontmatter = fmMatch ? fmMatch[1] : "";
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  const sections = sectionsOf(body);
  const legacy = isLegacyMadr(frontmatter);

  const { errors, warnings } = legacy
    ? lintMadr(raw, frontmatter, body, sections)
    : lintDerby(raw, frontmatter, body, sections);

  // Registered in ADR MOC (both formats).
  const numMatch = path.basename(file).match(/^(ADR-\d+)/);
  if (numMatch && mocRegisterText && !mocRegisterText.includes(numMatch[1])) {
    errors.push(`not registered in ADR MOC (no "${numMatch[1]}" entry in the Register)`);
  }

  // Related Notes should link something other than the ADR MOC (epic/solution).
  const related = sections.get("Related Notes") || "";
  const relLinks = (related.match(/\]\(([^)]+)\)/g) || []).filter((l) => !/ADR%20MOC|ADR MOC/.test(l));
  if (relLinks.length === 0) {
    warnings.push("Related Notes links only the ADR MOC (link the driving epic/solution too)");
  }

  return { errors, warnings, legacy };
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
    const { errors, warnings, legacy } = lintAdr(file, raw, mocRegisterText);
    totalErrors += errors.length;
    totalWarnings += warnings.length;
    const name = path.basename(file) + (legacy ? " [MADR-legacy]" : "");
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
