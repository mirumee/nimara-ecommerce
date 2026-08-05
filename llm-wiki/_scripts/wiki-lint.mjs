#!/usr/bin/env node

/**
 * Lints llm-wiki against llm-wiki/_schema.json.
 *
 * Every violation is an error. A rule that fires wrongly is either fixed or given an
 * `except` entry in the schema, so each suppression carries a written reason.
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse as parseYaml } from "yaml";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootArg = process.argv.indexOf("--root");
const wikiRoot =
  rootArg === -1
    ? path.resolve(scriptDir, "..")
    : path.resolve(process.argv[rootArg + 1]);
const schemaFile = path.join(wikiRoot, "_schema.json");

const usage = `Usage:
  pnpm wiki:lint             Check llm-wiki against _schema.json. Exits non-zero on any
                             violation.
  pnpm --silent wiki:lint -- --json
                             The same, as JSON. --silent is required: without it pnpm prints
                             its own banner to stdout and the output no longer parses.
  pnpm wiki:index:sync       Rewrite index.md and the MOC registers so every note has
                             exactly one entry. Existing hook text is preserved verbatim.

  --root <dir>               Lint a different wiki tree. Used to exercise the rules against
                             fixtures without mutating llm-wiki/.
`;

const RULES = [
  "unparsable-frontmatter",
  "missing-field",
  "forbidden-field",
  "bad-enum",
  "bad-format",
  "bad-relation-link",
  "misplaced-record",
  "template-incomplete",
  "link-unresolved",
  "anchor-unresolved",
  "orphan",
  "register-out-of-sync",
];

/* ------------------------------------------------------------------ utilities */

function collectMarkdown(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".")) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) collectMarkdown(full, acc);
    else if (entry.endsWith(".md")) acc.push(full);
  }
  return acc;
}

/** Blank out fenced code blocks, keeping the line count so line numbers stay true. */
function stripFences(text) {
  let inFence = false;
  return text
    .split("\n")
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return "";
      }
      return inFence ? "" : line;
    })
    .join("\n");
}

function splitFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return { text: null, lines: [], bodyLine: 1 };
  const end = raw.indexOf("\n---\n", 3);
  if (end === -1) return { text: null, lines: [], bodyLine: 1 };
  const text = raw.slice(4, end + 1);
  const lines = text.split("\n");
  return { text, lines, bodyLine: lines.length + 2 };
}

/** 1-indexed line of a frontmatter key path such as `availability.since`. */
function fieldLine(fmLines, dotted) {
  const parts = dotted.split(".");
  let depth = 0;
  let from = 0;
  for (const part of parts) {
    const indent = "  ".repeat(depth);
    const re = new RegExp(`^${indent}${part}:`);
    const found = fmLines.findIndex((line, i) => i >= from && re.test(line));
    if (found === -1) return 2;
    from = found + 1;
    depth += 1;
    if (part === parts.at(-1)) return found + 2;
  }
  return 2;
}

function get(obj, dotted) {
  return dotted
    .split(".")
    .reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function has(obj, dotted) {
  const parts = dotted.split(".");
  let cur = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object" || !(part in cur)) return false;
    cur = cur[part];
  }
  return true;
}

function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

const IS_SHA40 = (v) => typeof v === "string" && /^[0-9a-f]{40}$/.test(v);
const IS_TAG = (v) => typeof v === "string" && /^v\d+\.\d+\.\d+$/.test(v);

const FORMAT_CHECKS = {
  iso8601: (v) => typeof v === "string" && !Number.isNaN(Date.parse(v)),
  "tag-or-sha40-or-null": (v) => v === null || IS_TAG(v) || IS_SHA40(v),
  "issue-or-sha40": (v) =>
    typeof v === "string" && (/^\d+$/.test(v) || IS_SHA40(v)),
  "url-or-null": (v) =>
    v === null || (typeof v === "string" && /^https:\/\/\S+$/.test(v)),
};

/** Markdown links outside code fences, with the line they sit on. */
function extractLinks(text) {
  const out = [];
  stripFences(text)
    .split("\n")
    .forEach((line, i) => {
      for (const m of line.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
        const [target, anchor] = m[1].split("#");
        out.push({ target, anchor, line: i + 1 });
      }
    });
  return out;
}

/* ------------------------------------------------------------------ registers */

function matchGlob(pattern, relPaths) {
  if (!pattern.includes("*")) return relPaths.filter((p) => p === pattern);
  const dir = path.posix.dirname(pattern);
  const [prefix, suffix] = path.posix.basename(pattern).split("*");
  return relPaths.filter((p) => {
    if (path.posix.dirname(p) !== dir) return false;
    const base = path.posix.basename(p);
    return (
      base.length >= prefix.length + suffix.length &&
      base.startsWith(prefix) &&
      base.endsWith(suffix)
    );
  });
}

const ROW_RE = /^- \[([^\]]+)\]\(([^)]+)\)(?:\s*[-—]\s*(.*))?$/;

function readRegister(register, relPaths, notes) {
  const file = path.join(wikiRoot, register.file);
  const lines = existsSync(file)
    ? readFileSync(file, "utf8").split("\n")
    : null;
  if (lines === null)
    return { file, lines: null, sections: [], wanted: new Map(), notes };
  const dirOf =
    path.posix.dirname(register.file) === "."
      ? ""
      : path.posix.dirname(register.file);
  const headingRe = new RegExp(`^#{${register.headingLevel}} (.+)$`);
  const sections = [];

  lines.forEach((line, i) => {
    const m = headingRe.exec(line);
    if (m)
      sections.push({
        name: m[1].trim(),
        heading: i,
        rows: [],
        end: lines.length,
      });
  });
  sections.forEach((section, i) => {
    section.end =
      i + 1 < sections.length ? sections[i + 1].heading : lines.length;
    for (let i2 = section.heading + 1; i2 < section.end; i2 += 1) {
      const m = ROW_RE.exec(lines[i2]);
      if (!m) continue;
      const target = decodeURIComponent(m[2].split("#")[0]);
      const resolved = path.posix.normalize(path.posix.join(dirOf, target));
      section.rows.push({
        line: i2,
        raw: lines[i2],
        resolved,
        text: m[1],
        hook: m[3] ?? "",
      });
    }
  });

  const wanted = new Map();
  for (const [name, globs] of Object.entries(register.sections)) {
    const paths = [...new Set(globs.flatMap((g) => matchGlob(g, relPaths)))]
      .filter((p) => p !== register.file)
      .sort((a, b) => a.localeCompare(b));
    wanted.set(name, paths);
  }

  return { file, lines, dirOf, sections, wanted, notes };
}

function renderRow(register, relPath, note, hook) {
  const dirOf =
    path.posix.dirname(register.file) === "."
      ? ""
      : path.posix.dirname(register.file);
  const target = path.posix.relative(dirOf, relPath);
  const encoded = target.split("/").map(encodeURIComponent).join("/");
  const stem = path.posix.basename(relPath, ".md");
  const isRecord = /^(PRD|RFC|ADR|IMP|CAP|INT|FLOW|OPS)-\d+ /.test(stem);
  const text = isRecord ? stem : (note?.fm?.title ?? stem);
  const body = hook ?? note?.fm?.description ?? "";
  return `- [${text}](${encoded})${body ? ` ${register.separator} ${body}` : ""}`;
}

/** Diff a register against the tree. Returns findings plus a rewritten line array. */
function reconcileRegister(register, relPaths, notes) {
  const reg = readRegister(register, relPaths, notes);
  const findings = [];
  const replacements = [];

  /* A register named by the schema but absent from the tree is a schema/tree mismatch. */
  if (reg.lines === null) {
    const inScope = Object.values(register.sections)
      .flatMap((globs) => globs.flatMap((g) => matchGlob(g, relPaths)))
      .filter((p) => p !== register.file);
    if (inScope.length > 0) {
      findings.push({
        file: register.file,
        line: 1,
        rule: "register-out-of-sync",
        message: `register does not exist, but ${inScope.length} note(s) are in its scope`,
      });
    }
    return { findings, file: reg.file, lines: null, changed: false };
  }

  /* Register-wide, so a note listed under two sections is caught as well. */
  const seen = new Set();

  for (const section of reg.sections) {
    const wanted = reg.wanted.get(section.name);
    if (!wanted) continue;
    const byPath = new Map(section.rows.map((r) => [r.resolved, r]));

    for (const row of section.rows) {
      if (seen.has(row.resolved)) {
        findings.push({
          file: register.file,
          line: row.line + 1,
          rule: "register-out-of-sync",
          message: `duplicate entry: ${row.resolved} is already listed under "${section.name}"`,
        });
        continue;
      }
      seen.add(row.resolved);
      if (!wanted.includes(row.resolved)) {
        findings.push({
          file: register.file,
          line: row.line + 1,
          rule: "register-out-of-sync",
          message: `stale entry: ${row.resolved} is not in scope of section "${section.name}"`,
        });
      }
    }
    for (const relPath of wanted) {
      if (!byPath.has(relPath)) {
        findings.push({
          file: register.file,
          line: section.heading + 1,
          rule: "register-out-of-sync",
          message: `missing entry under "${section.name}": ${relPath}`,
        });
      }
    }

    /*
     * Existing rows keep their order and their text. Several sections are curated — the MOC
     * first, then a reading order — so sorting them would destroy information the tree does
     * not carry. New rows are appended; move them by hand if the section has an order.
     */
    const kept = new Set();
    const rendered = [
      ...section.rows
        .filter(
          (row) => wanted.includes(row.resolved) && !kept.has(row.resolved),
        )
        .map((row) => {
          kept.add(row.resolved);
          return row.raw;
        }),
      ...wanted
        .filter((relPath) => !byPath.has(relPath))
        .map((relPath) =>
          renderRow(register, relPath, notes.get(relPath), null),
        ),
    ];
    const first = section.rows[0]?.line ?? section.end;
    const last = (section.rows.at(-1)?.line ?? section.end - 1) + 1;
    replacements.push({ from: first, to: last, rendered });
  }

  let lines = reg.lines;
  for (const r of [...replacements].sort((a, b) => b.from - a.from)) {
    lines = [...lines.slice(0, r.from), ...r.rendered, ...lines.slice(r.to)];
  }
  return {
    findings,
    file: reg.file,
    lines,
    changed: lines.join("\n") !== reg.lines.join("\n"),
  };
}

/* ------------------------------------------------------------------ main */

const schema = JSON.parse(readFileSync(schemaFile, "utf8"));
const files = collectMarkdown(wikiRoot).sort();
const relPaths = files.map((f) => path.posix.relative(wikiRoot, f));
const typeByDir = new Map(
  Object.entries(schema.records).map(([type, spec]) => [
    spec.dir,
    { type, ...spec },
  ]),
);

const notes = new Map();
const findings = [];
const examined = Object.fromEntries(RULES.map((r) => [r, 0]));

function report(rule, relPath, line, message, target = null) {
  findings.push({
    file: relPath,
    line,
    rule,
    message,
    ...(target ? { target } : {}),
  });
}

for (const [i, file] of files.entries()) {
  const relPath = relPaths[i];
  const raw = readFileSync(file, "utf8");
  const { text, lines: fmLines, bodyLine } = splitFrontmatter(raw);
  let fm = null;
  let parseError = null;
  if (text !== null) {
    try {
      fm = parseYaml(text) ?? {};
    } catch (error) {
      parseError = error.message.split("\n")[0];
    }
  }
  notes.set(relPath, { relPath, raw, fm, fmLines, bodyLine, parseError });
}

const typesInUse = new Set(
  [...notes.values()]
    .filter(
      (n) =>
        n.fm?.type && path.posix.dirname(n.relPath) !== schema.templates.dir,
    )
    .map((n) => n.fm.type),
);

for (const note of notes.values()) {
  const { relPath, raw, fm, fmLines } = note;
  const exemptBase = relPath in schema.base.except;

  examined["unparsable-frontmatter"] += 1;
  if (note.parseError) {
    report("unparsable-frontmatter", relPath, 1, note.parseError);
    continue;
  }

  /* base contract */
  if (!exemptBase) {
    examined["missing-field"] += 1;
    examined["forbidden-field"] += 1;
    if (fm === null) {
      report("missing-field", relPath, 1, "no frontmatter block");
    } else {
      for (const field of schema.base.required) {
        if (!has(fm, field))
          report("missing-field", relPath, 1, `base field \`${field}\``);
      }
      for (const field of schema.base.forbidden) {
        if (has(fm, field))
          report(
            "forbidden-field",
            relPath,
            fieldLine(fmLines, field),
            `\`${field}\` was removed from the schema`,
          );
      }
      const format = schema.formats.created;
      if (has(fm, "created") && !FORMAT_CHECKS[format](fm.created)) {
        examined["bad-format"] += 1;
        report(
          "bad-format",
          relPath,
          fieldLine(fmLines, "created"),
          `created is not ${format}`,
        );
      }
    }
  }
  if (fm === null) continue;

  const dir = path.posix.dirname(relPath);
  const stem = path.posix.basename(relPath, ".md");
  const spec = schema.records[fm.type];
  const dirSpec = typeByDir.get(dir);
  const isTemplate = dir === schema.templates.dir;

  /* templates: structure only */
  if (isTemplate) {
    examined["template-incomplete"] += 1;
    if (fm.type !== schema.templates.type) {
      report(
        "template-incomplete",
        relPath,
        fieldLine(fmLines, "type"),
        `type is "${fm.type}", expected "${schema.templates.type}"`,
      );
    } else if (!fm.template_for) {
      /* A template with no `template_for` is the generic one; it has no record contract. */
    } else if (
      !schema.records[fm.template_for] &&
      !typesInUse.has(fm.template_for)
    ) {
      /*
       * Checked against the types the wiki actually uses, not an allowlist: the `type`
       * vocabulary is deliberately open, but a typo in `template_for` still has to fail.
       */
      report(
        "template-incomplete",
        relPath,
        fieldLine(fmLines, "template_for"),
        `template_for names a type no note uses: "${fm.template_for}"`,
      );
    } else if (schema.records[fm.template_for]) {
      for (const field of schema.records[fm.template_for].required) {
        if (!has(fm, field))
          report(
            "template-incomplete",
            relPath,
            1,
            `missing field required by ${fm.template_for}: \`${field}\``,
          );
      }
    }
    continue;
  }

  /* record contract */
  /*
   * Checked both ways, and never inferred from the directory alone: a MOC or an overview
   * legitimately sits next to the records it registers.
   */
  const namedLikeRecord =
    dirSpec && new RegExp(`^${dirSpec.prefix}-\\d+ `).test(stem);
  if (spec || namedLikeRecord) {
    examined["misplaced-record"] += 1;
    if (spec && spec.dir !== dir) {
      report(
        "misplaced-record",
        relPath,
        fieldLine(fmLines, "type"),
        `type "${fm.type}" belongs in ${spec.dir}/`,
      );
    } else if (namedLikeRecord && !spec) {
      report(
        "misplaced-record",
        relPath,
        fieldLine(fmLines, "type"),
        `filename claims a ${dirSpec.type}, but type is "${fm.type}"`,
      );
    } else if (spec) {
      const idRe = new RegExp(`^${spec.prefix}-\\d{${spec.digits}} .+`);
      if (!idRe.test(stem))
        report(
          "misplaced-record",
          relPath,
          1,
          `filename must match \`${spec.prefix}-${"N".repeat(spec.digits)} <Title>.md\``,
        );
    }
  }
  if (!spec) continue;

  examined["missing-field"] += 1;
  for (const field of spec.required) {
    if (!has(fm, field))
      report("missing-field", relPath, 1, `${fm.type} field \`${field}\``);
  }

  examined["bad-enum"] += 1;
  for (const [field, allowed] of Object.entries(spec.enum ?? {})) {
    const value = get(fm, field);
    if (value !== undefined && !allowed.includes(value))
      report(
        "bad-enum",
        relPath,
        fieldLine(fmLines, field),
        `${field} is "${value}", allowed: ${allowed.join(", ")}`,
      );
  }

  examined["bad-format"] += 1;
  for (const [field, format] of Object.entries(schema.formats)) {
    if (field === "created" || !has(fm, field)) continue;
    if (!FORMAT_CHECKS[format](get(fm, field)))
      report(
        "bad-format",
        relPath,
        fieldLine(fmLines, field),
        `${field} does not match ${format}`,
      );
  }
  if (has(fm, "work_item.id") && has(fm, "work_item.url")) {
    const urlShouldBeNull = IS_SHA40(fm.work_item.id);
    if (urlShouldBeNull !== (fm.work_item.url === null))
      report(
        "bad-format",
        relPath,
        fieldLine(fmLines, "work_item.url"),
        "work_item.url must be null exactly when work_item.id is a commit SHA",
      );
  }
  for (const [field, cond] of Object.entries(spec.nullUnless ?? {})) {
    const [condField, condValue] = Object.entries(cond)[0];
    const shouldBeNull = get(fm, condField) !== condValue;
    if (shouldBeNull !== (get(fm, field) === null))
      report(
        "bad-format",
        relPath,
        fieldLine(fmLines, field),
        `${field} must be null unless ${condField} is "${condValue}"`,
      );
  }
  const anyNonEmpty = spec.anyNonEmpty ?? [];
  if (
    anyNonEmpty.length &&
    anyNonEmpty.every((f) => (get(fm, f) ?? []).length === 0)
  ) {
    report(
      "bad-format",
      relPath,
      fieldLine(fmLines, anyNonEmpty[0]),
      `at least one of ${anyNonEmpty.join(", ")} must be non-empty`,
    );
  }

  examined["bad-relation-link"] += 1;
  for (const field of spec.linkFields ?? []) {
    const value = get(fm, field);
    const items = value === null || value === undefined ? [] : [].concat(value);
    for (const item of items) {
      if (typeof item !== "string" || item === "") continue;
      const m = /^\[[^\]]*\]\(([^)]+)\)$/.exec(item);
      if (!m) {
        report(
          "bad-relation-link",
          relPath,
          fieldLine(fmLines, field),
          `${field} must hold Markdown links, found: ${item}`,
        );
        continue;
      }
      const target = decodeURIComponent(m[1].split("#")[0]);
      const resolved = path.posix.normalize(path.posix.join(dir, target));
      if (!notes.has(resolved))
        report(
          "bad-relation-link",
          relPath,
          fieldLine(fmLines, field),
          `${field} link does not resolve: ${target}`,
          resolved,
        );
    }
  }
}

/* graph: links, anchors, orphans */
const inbound = new Map(relPaths.map((p) => [p, 0]));
for (const note of notes.values()) {
  examined["link-unresolved"] += 1;
  examined["anchor-unresolved"] += 1;
  const dir = path.posix.dirname(note.relPath);
  for (const link of extractLinks(note.raw)) {
    if (/^(https?:|mailto:)/.test(link.target)) continue;
    if (link.target === "") continue;
    const resolved = path.posix.normalize(
      path.posix.join(dir, decodeURIComponent(link.target)),
    );
    if (!notes.has(resolved)) {
      /*
       * A link may point outside the linted set and still resolve: `_schema.json`, or a skill
       * under `.claude/`, which the walk skips. Only its anchors go unchecked.
       */
      if (existsSync(path.join(wikiRoot, resolved))) continue;
      report("link-unresolved", note.relPath, link.line, resolved, resolved);
      continue;
    }
    inbound.set(resolved, (inbound.get(resolved) ?? 0) + 1);
    if (link.anchor) {
      const target = notes.get(resolved);
      const slugs = new Set(
        stripFences(target.raw)
          .split("\n")
          .filter((l) => /^#{1,6} /.test(l))
          .map((l) => slugify(l.replace(/^#+ /, ""))),
      );
      if (!slugs.has(link.anchor.toLowerCase()))
        report(
          "anchor-unresolved",
          note.relPath,
          link.line,
          `${resolved}#${link.anchor}`,
        );
    }
  }
}
for (const [relPath, count] of inbound) {
  if (relPath in schema.rules.orphan.except) continue;
  examined.orphan += 1;
  if (count === 0) report("orphan", relPath, 1, "no inbound links");
}

/* registers */
const command =
  process.argv[2] === "sync"
    ? "sync"
    : process.argv.includes("--help")
      ? "help"
      : "lint";
const registerResults = [];
for (const register of schema.registers) {
  if (register.file in schema.rules["register-out-of-sync"].except) continue;
  examined["register-out-of-sync"] += 1;
  const result = reconcileRegister(register, relPaths, notes);
  registerResults.push({ register, ...result });
  if (command !== "sync") findings.push(...result.findings);
}

if (command === "help") {
  console.log(usage);
  process.exit(0);
}

if (command === "sync") {
  let touched = 0;
  for (const result of registerResults) {
    if (!result.changed) continue;
    writeFileSync(result.file, result.lines.join("\n"));
    touched += 1;
    console.log(`updated ${path.posix.relative(wikiRoot, result.file)}`);
    for (const f of result.findings) console.log(`  ${f.message}`);
  }
  console.log(
    touched === 0
      ? `${registerResults.length} register(s) already in sync.`
      : `${touched} register(s) updated. Review inserted hook text: it is copied from the note's description.`,
  );
  process.exit(0);
}

const asJson = process.argv.includes("--json");

/*
 * Frontmatter is scanned for links too, because prose fields such as an IMP's `rollback` carry
 * them. A relation field that fails therefore matches twice; report the specific rule only.
 */
const relationTargets = new Set(
  findings
    .filter((f) => f.rule === "bad-relation-link" && f.target)
    .map((f) => `${f.file}|${f.target}`),
);
const reported = findings.filter(
  (f) =>
    !(
      f.rule === "link-unresolved" &&
      relationTargets.has(`${f.file}|${f.target}`)
    ),
);
findings.length = 0;
findings.push(...reported);
findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

if (asJson) {
  console.log(
    JSON.stringify({ findings, examined, files: files.length }, null, 2),
  );
} else {
  for (const f of findings)
    console.log(`${f.file}:${f.line}  ${f.rule}  ${f.message}`);
  console.log(`\n${findings.length} violation(s) in ${files.length} file(s).`);
  const unexercised = RULES.filter((r) => examined[r] === 0);
  console.log(
    RULES.map(
      (r) => `  ${String(examined[r]).padStart(3)} examined  ${r}`,
    ).join("\n"),
  );
  if (unexercised.length)
    console.log(
      `\nWARNING: these rules examined nothing, so their silence proves nothing: ${unexercised.join(", ")}`,
    );
}

process.exit(findings.length > 0 ? 1 : 0);
