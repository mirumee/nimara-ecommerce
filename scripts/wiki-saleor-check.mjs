#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schemaFile = path.join(repoRoot, "packages", "codegen", "schema.ts");
const saleorNotesDir = path.join(repoRoot, "llm-wiki", "tech", "saleor");
const HASH_LENGTH = 12;

const command = process.argv[2] || "check";

const usage = `Usage:
  pnpm wiki:saleor:hash    Print the current Saleor schema stamp (short sha256 of
                           packages/codegen/schema.ts). Paste it into a note's
                           saleor_schema_hash frontmatter when authoring or updating.
  pnpm wiki:saleor:check   Compare each note in llm-wiki/tech/saleor/ against the
                           current schema stamp. Exits non-zero if any note is STALE.

The stamp is the schema Nimara's codegen last produced. It changes only after
\`pnpm codegen\` runs against a (possibly different) Saleor instance, which is the
signal that Saleor schema notes should be reviewed.
`;

function fail(message, status = 1) {
  console.error(message);
  process.exit(status);
}

/** Short sha256 of the committed generated schema, or null in zero-config mode. */
function currentSchemaHash() {
  if (!existsSync(schemaFile)) {
    return null;
  }

  const bytes = readFileSync(schemaFile);

  return createHash("sha256").update(bytes).digest("hex").slice(0, HASH_LENGTH);
}

/** Read the `saleor_schema_hash` value from a note's YAML frontmatter. */
function readNoteHash(fileContent) {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {
    return null;
  }

  const field = match[1].match(/^\s*saleor_schema_hash:\s*["']?([^"'\n]+)["']?\s*$/m);

  return field ? field[1].trim() : null;
}

function collectMarkdown(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  const files = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectMarkdown(full));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(full);
    }
  }

  return files;
}

function printHash() {
  const hash = currentSchemaHash();

  if (!hash) {
    fail(
      `No schema found at ${path.relative(repoRoot, schemaFile)}.\n` +
        "Run `pnpm codegen` with NEXT_PUBLIC_SALEOR_API_URL set first.",
    );
  }

  console.log(hash);
}

function check() {
  const current = currentSchemaHash();

  if (!current) {
    console.log(
      `No schema at ${path.relative(repoRoot, schemaFile)} (zero-config mode).`,
    );
    console.log("Nothing to verify — run `pnpm codegen` to generate the schema.");

    return;
  }

  const notes = collectMarkdown(saleorNotesDir);

  if (!notes.length) {
    console.log(
      `No Saleor notes found under ${path.relative(repoRoot, saleorNotesDir)}/.`,
    );

    return;
  }

  console.log(`Current Saleor schema stamp: ${current}\n`);

  let stale = 0;
  let missing = 0;

  for (const file of notes) {
    const rel = path.relative(repoRoot, file);
    const noteHash = readNoteHash(readFileSync(file, "utf8"));

    if (!noteHash) {
      missing += 1;
      console.log(`  ??  ${rel} — no saleor_schema_hash in frontmatter`);
    } else if (noteHash === current) {
      console.log(`  OK  ${rel}`);
    } else {
      stale += 1;
      console.log(`STALE  ${rel} — stamped ${noteHash}, current ${current}`);
    }
  }

  console.log(
    `\n${notes.length} note(s): ${notes.length - stale - missing} OK, ` +
      `${stale} STALE, ${missing} unstamped.`,
  );

  if (stale || missing) {
    console.log(
      "\nReview STALE/unstamped notes against the current schema, then restamp " +
        "with `pnpm wiki:saleor:hash`.",
    );
    process.exit(1);
  }
}

switch (command) {
  case "help":
  case "--help":
  case "-h":
    console.log(usage);
    break;
  case "hash":
    printHash();
    break;
  case "check":
    check();
    break;
  default:
    fail(`Unknown command: ${command}\n\n${usage}`);
}
